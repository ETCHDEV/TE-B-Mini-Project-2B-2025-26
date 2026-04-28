"""
FastAPI Routers
===============
/api/v1/ml/      — Pure ML endpoints (no LLM)
/api/v1/ai/      — OpenRouter LLM insight endpoints
/api/v1/data/    — Dataset metadata & search
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.schemas import (
    PredictRequest, PredictResponse, SentimentResult,
    AnalyzeProductRequest, ProductAnalysis,
    CompareProductsRequest,
    SearchRequest,
    AIInsightRequest, AIInsightResponse,
)
from ml import (
    predict_sentiment, analyze_product, compare_products,
    search_reviews, get_products, get_platforms, get_categories,
)
from app.ai_client import generate_product_insight, generate_comparison_insight, DEFAULT_MODEL

# ---------------------------------------------------------------------------
# ML Router
# ---------------------------------------------------------------------------

ml_router = APIRouter(prefix="/ml", tags=["ML — Sentiment Analysis"])


@ml_router.post("/predict", response_model=PredictResponse, summary="Classify sentiment of review texts")
def predict(req: PredictRequest):
    """
    Run the TF-IDF + Logistic Regression classifier on raw review texts.
    Returns sentiment label, confidence, and per-class probability scores.
    """
    results = predict_sentiment(req.texts)
    return PredictResponse(
        results=[SentimentResult(**r) for r in results],
        total=len(results),
    )


@ml_router.post("/analyze", summary="Full product sentiment analysis")
def analyze(req: AnalyzeProductRequest):
    """
    Comprehensive analysis for a product:
    - ML-predicted sentiment distribution
    - Rating distribution
    - Top positive & negative reviews (ranked by model confidence)
    - Per-platform breakdown with sentiment scores
    - Monthly sentiment trend
    """
    result = analyze_product(
        product_name=req.product_name,
        platforms=req.platforms,
        top_n=req.top_n,
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@ml_router.post("/compare", summary="Compare multiple products side by side")
def compare(req: CompareProductsRequest):
    """
    Returns a lightweight comparison summary for 2-10 products.
    Good for ranking products by sentiment score.
    """
    results = compare_products(req.product_names)
    if not results:
        raise HTTPException(status_code=404, detail="No products found")
    return {"products": results, "count": len(results)}


@ml_router.get("/product/{product_name}", summary="Quick analyze by product name (GET)")
def analyze_get(
    product_name: str,
    platforms: Optional[str] = Query(None, description="Comma-separated platforms"),
    top_n: int = Query(5, ge=1, le=20),
):
    """GET convenience wrapper for /ml/analyze."""
    platform_list = [p.strip() for p in platforms.split(",")] if platforms else None
    result = analyze_product(product_name=product_name, platforms=platform_list, top_n=top_n)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ---------------------------------------------------------------------------
# AI Insight Router
# ---------------------------------------------------------------------------

ai_router = APIRouter(prefix="/ai", tags=["AI — OpenRouter LLM Insights"])


@ai_router.post("/insight", response_model=AIInsightResponse, summary="Generate AI insight for a product")
def ai_insight(req: AIInsightRequest):
    """
    Uses OpenRouter (GPT-4o-mini / free fallback) to generate a natural-language
    insight report from the product's ML analysis data.

    Optionally, pass a `question` to get a specific answer instead of a full report.
    """
    try:
        insight = generate_product_insight(
            analysis=req.analysis_data,
            question=req.question,
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenRouter error: {str(e)}")

    return AIInsightResponse(
        product_name=req.product_name,
        insight=insight,
        model_used=DEFAULT_MODEL,
    )


@ai_router.post("/analyze-and-insight", summary="Full ML analysis + AI insight in one call")
def analyze_and_insight(
    product_name: str = Query(...),
    platforms: Optional[str] = Query(None),
    question: Optional[str] = Query(None),
    top_n: int = Query(5),
):
    """
    Convenience endpoint: runs ML analysis then feeds results to the LLM.
    Returns both structured ML data and the AI-generated narrative.
    """
    platform_list = [p.strip() for p in platforms.split(",")] if platforms else None
    ml_result = analyze_product(product_name=product_name, platforms=platform_list, top_n=top_n)
    if "error" in ml_result:
        raise HTTPException(status_code=404, detail=ml_result["error"])

    try:
        insight = generate_product_insight(analysis=ml_result, question=question)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenRouter error: {str(e)}")

    return {
        "ml_analysis": ml_result,
        "ai_insight": insight,
        "model_used": DEFAULT_MODEL,
    }


@ai_router.post("/compare-insight", summary="AI-powered comparison of multiple products")
def compare_insight(req: CompareProductsRequest):
    """
    Runs comparison ML analysis and generates an LLM buying recommendation.
    """
    products = compare_products(req.product_names)
    if not products:
        raise HTTPException(status_code=404, detail="No products found")

    try:
        insight = generate_comparison_insight(products)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenRouter error: {str(e)}")

    return {
        "products": products,
        "ai_comparison": insight,
        "model_used": DEFAULT_MODEL,
    }


# ---------------------------------------------------------------------------
# Data Router
# ---------------------------------------------------------------------------

data_router = APIRouter(prefix="/data", tags=["Data — Metadata & Search"])


@data_router.get("/products", summary="List all products in the dataset")
def list_products():
    return {"products": get_products(), "count": len(get_products())}


@data_router.get("/platforms", summary="List all platforms in the dataset")
def list_platforms():
    return {"platforms": get_platforms(), "count": len(get_platforms())}


@data_router.get("/categories", summary="List all product categories")
def list_categories():
    return {"categories": get_categories(), "count": len(get_categories())}


@data_router.post("/search", summary="Keyword search across all reviews")
def search(req: SearchRequest):
    """
    Search review texts by keyword with optional filters:
    product name, platform, sentiment label.
    """
    results = search_reviews(
        query=req.query,
        product_name=req.product_name,
        platform=req.platform,
        sentiment=req.sentiment,
        limit=req.limit,
    )
    return {"results": results, "count": len(results), "query": req.query}


@data_router.get("/stats", summary="Dataset-level statistics")
def dataset_stats():
    """High-level stats: total reviews, product count, platform counts, etc."""
    from ml.pipeline import load_data
    df = load_data()
    return {
        "total_reviews": len(df),
        "total_products": df["product_name"].nunique(),
        "total_platforms": df["platform"].nunique(),
        "total_categories": df["category"].nunique(),
        "platforms": df["platform"].value_counts().to_dict(),
        "categories": df["category"].value_counts().to_dict(),
        "overall_sentiment": df["sentiment"].value_counts().to_dict(),
        "avg_rating": round(df["rating"].mean(), 2),
        "rating_distribution": df["rating"].value_counts().sort_index().to_dict(),
    }


# ---------------------------------------------------------------------------
# Model Comparison Router
# ---------------------------------------------------------------------------

comparison_router = APIRouter(prefix="/models", tags=["Models — Training & Comparison"])


@comparison_router.get("/report", summary="Get model comparison report")
def get_comparison_report():
    """
    Returns the full model comparison leaderboard: accuracy, macro F1,
    weighted F1, per-class metrics, confusion matrix, and train time
    for all 10 models. Shows which model was selected as best.
    """
    from ml.model_comparison import load_comparison_report
    report = load_comparison_report()
    if not report:
        raise HTTPException(
            status_code=404,
            detail="No comparison report found. POST /models/train to run comparison."
        )
    return report


@comparison_router.post("/train", summary="Run full model comparison and select best model")
def train_models(force: bool = False):
    """
    Trains and evaluates all 10 models on the dataset:
      Logistic Regression, SGD, Multinomial NB, Complement NB,
      Linear SVC, Ridge Classifier, Random Forest, Gradient Boosting,
      Decision Tree, KNN

    Selects the winner by macro F1 score, runs 5-fold cross-validation
    on the winner, then retrains on the full dataset for production.

    ⚠️  This takes 2–5 minutes. Set force=true to retrain even if a model exists.
    """
    from pathlib import Path
    from ml.model_comparison import run_comparison, load_comparison_report, BEST_MODEL_PATH

    if not force and BEST_MODEL_PATH.exists():
        report = load_comparison_report()
        return {
            "status": "already_trained",
            "message": "Best model already exists. Use force=true to retrain.",
            "best_model": report["best_model"] if report else "unknown",
            "best_macro_f1": report["best_macro_f1"] if report else None,
        }

    # Invalidate cached model in pipeline
    import ml.pipeline as pipe
    pipe._model_cache = None

    report = run_comparison(save=True)
    return {
        "status": "success",
        "best_model": report["best_model"],
        "best_macro_f1": report["best_macro_f1"],
        "best_accuracy": report["best_accuracy"],
        "cross_validation": report["cross_validation"],
        "total_models_compared": len(report["rankings"]),
        "leaderboard": [
            {
                "rank": i + 1,
                "model": r["model_name"],
                "accuracy": r["accuracy"],
                "macro_f1": r["macro_f1"],
                "weighted_f1": r["weighted_f1"],
                "train_time_sec": r["train_time_sec"],
            }
            for i, r in enumerate(report["rankings"])
        ],
    }


@comparison_router.get("/leaderboard", summary="Quick leaderboard view")
def get_leaderboard():
    """Condensed leaderboard — just rankings with key metrics."""
    from ml.model_comparison import load_comparison_report
    report = load_comparison_report()
    if not report:
        raise HTTPException(
            status_code=404,
            detail="No comparison report found. POST /models/train first."
        )
    return {
        "best_model": report["best_model"],
        "leaderboard": [
            {
                "rank": i + 1,
                "model": r["model_name"],
                "accuracy": r["accuracy"],
                "macro_f1": r["macro_f1"],
                "weighted_f1": r["weighted_f1"],
                "negative_f1": r["per_class"]["Negative"]["f1_score"],
                "neutral_f1":  r["per_class"]["Neutral"]["f1_score"],
                "positive_f1": r["per_class"]["Positive"]["f1_score"],
                "train_time_sec": r["train_time_sec"],
                "infer_ms_per_sample": r["infer_ms_per_sample"],
            }
            for i, r in enumerate(report["rankings"])
        ],
    }
