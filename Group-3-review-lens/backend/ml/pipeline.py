"""
ML Pipeline — Multi-Platform Product Review Sentiment Analyzer
==============================================================
Handles:
  - Text cleaning & tokenization
  - TF-IDF feature extraction
  - Best model auto-selected from comparison of 10 classifiers
  - Sentiment score computation per product/platform
  - Top positive / negative review extraction
  - Rating distribution & sentiment distribution stats

FIX: Dataset deduplication applied on load to prevent:
  1. Data leakage in model training (duplicate reviews in train+test)
  2. Inflated review counts in analytics (same text recycled across products)
  3. Meaningless per-product/platform breakdowns
"""

import re
import logging
import pickle
import warnings
from pathlib import Path
from typing import Optional

import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

DATA_PATH  = Path(__file__).parent.parent / "data" / "reviews.csv"
MODELS_DIR = Path(__file__).parent.parent / "data" / "models"
MODEL_PATH = MODELS_DIR / "best_model.pkl"

# ---------------------------------------------------------------------------
# NLTK stopwords — inline fallback so no download needed at runtime
# ---------------------------------------------------------------------------
STOPWORDS = {
    "i","me","my","myself","we","our","ours","ourselves","you","your","yours",
    "yourself","yourselves","he","him","his","himself","she","her","hers",
    "herself","it","its","itself","they","them","their","theirs","themselves",
    "what","which","who","whom","this","that","these","those","am","is","are",
    "was","were","be","been","being","have","has","had","having","do","does",
    "did","doing","a","an","the","and","but","if","or","because","as","until",
    "while","of","at","by","for","with","about","against","between","into",
    "through","during","before","after","above","below","to","from","up","down",
    "in","out","on","off","over","under","again","further","then","once","here",
    "there","when","where","why","how","all","both","each","few","more","most",
    "other","some","such","no","nor","not","only","own","same","so","than",
    "too","very","s","t","can","will","just","don","should","now","d","ll",
    "m","o","re","ve","y","ain","aren","couldn","didn","doesn","hadn","hasn",
    "haven","isn","ma","mightn","mustn","needn","shan","shouldn","wasn",
    "weren","won","wouldn",
}


# ---------------------------------------------------------------------------
# Text Preprocessing
# ---------------------------------------------------------------------------

def clean_text(text: str) -> str:
    """Lowercase, remove punctuation, digits, extra whitespace."""
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize(text: str) -> list[str]:
    """Split cleaned text into tokens, remove stopwords, min length 2."""
    return [w for w in text.split() if w not in STOPWORDS and len(w) > 2]


def preprocess(text: str) -> str:
    """Full pipeline: clean → tokenize → rejoin (for sklearn vectorizer)."""
    return " ".join(tokenize(clean_text(text)))


# ---------------------------------------------------------------------------
# Dataset Loader
# ---------------------------------------------------------------------------

_df_cache: Optional[pd.DataFrame] = None


def load_data(deduplicate: bool = True) -> pd.DataFrame:
    """
    Load and preprocess the reviews dataset.

    Args:
        deduplicate: If True (default), drops duplicate review_text rows before
                     returning. This is REQUIRED for correct model training and
                     for meaningful analytics — the dataset generator recycles
                     the same review texts across many products/platforms, so
                     without deduplication:
                       • Model training leaks test data → artificially perfect scores
                       • Per-product analytics show the same recycled reviews → meaningless

    WARNING: With the current dataset (80 unique reviews recycled ~330× each),
    per-product and per-platform breakdowns are unreliable even after dedup
    because each product doesn't have its own distinct reviews. Regenerate
    the dataset with 1000+ unique reviews for meaningful product-level analytics.
    """
    global _df_cache
    if _df_cache is not None:
        return _df_cache

    logger.info(f"Loading dataset from {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()

    # Normalize sentiment labels
    df["sentiment"] = df["sentiment"].str.strip().str.capitalize()

    # Numeric rating column
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce")

    if deduplicate:
        before = len(df)
        df = df.drop_duplicates(subset=["review_text"]).copy()
        after = len(df)
        removed = before - after
        if removed > 0:
            logger.warning(
                f"⚠️  Removed {removed:,} duplicate rows on load "
                f"({before:,} → {after:,} unique reviews). "
                "The dataset generator recycled review texts across products/platforms. "
                "Regenerate with unique reviews per product for reliable analytics."
            )

    # Preprocess review text
    df["clean_text"] = df["review_text"].apply(preprocess)

    _df_cache = df
    logger.info(
        f"Dataset loaded: {len(df)} rows, "
        f"{df['product_name'].nunique()} products, "
        f"{df['platform'].nunique()} platforms"
    )
    return df


def invalidate_cache():
    """Force reload of dataset on next load_data() call."""
    global _df_cache
    _df_cache = None


# ---------------------------------------------------------------------------
# Model Loading  (best model chosen by model_comparison.py)
# ---------------------------------------------------------------------------

def load_or_train_model(df: pd.DataFrame) -> Pipeline:
    """
    Load the best model saved by the model comparison engine.
    If not found, automatically runs the full comparison to pick + save the best model.
    """
    if MODEL_PATH.exists():
        logger.info(f"Loading best model from {MODEL_PATH}")
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)

    logger.warning("No trained model found. Running model comparison to select best model...")
    from ml.model_comparison import run_comparison
    run_comparison(save=True)
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

_model_cache: Optional[Pipeline] = None
_label_map = {0: "Negative", 1: "Neutral", 2: "Positive"}


def get_model() -> Pipeline:
    global _model_cache
    if _model_cache is None:
        df = load_data()
        _model_cache = load_or_train_model(df)
    return _model_cache


def predict_sentiment(texts: list[str]) -> list[dict]:
    """
    Predict sentiment for a list of raw review texts.
    Returns list of {sentiment, confidence, scores}.
    """
    model = get_model()
    cleaned = [preprocess(t) for t in texts]
    preds   = model.predict(cleaned)
    probas  = model.predict_proba(cleaned)

    results = []
    for pred, proba in zip(preds, probas):
        results.append({
            "sentiment":  _label_map[pred],
            "confidence": round(float(proba.max()), 4),
            "scores": {
                "Negative": round(float(proba[0]), 4),
                "Neutral":  round(float(proba[1]), 4),
                "Positive": round(float(proba[2]), 4),
            },
        })
    return results


# ---------------------------------------------------------------------------
# Analytics Engine
# ---------------------------------------------------------------------------

def get_products() -> list[str]:
    return sorted(load_data()["product_name"].unique().tolist())


def get_platforms() -> list[str]:
    return sorted(load_data()["platform"].unique().tolist())


def get_categories() -> list[str]:
    return sorted(load_data()["category"].unique().tolist())


def _attach_ml_predictions(subset: pd.DataFrame, model: Pipeline) -> pd.DataFrame:
    """
    Add ML sentiment predictions and probability scores to a review subset.
    Mutates a copy of the subset — safe to call with any filtered slice.
    """
    subset = subset.copy()
    preds  = model.predict(subset["clean_text"].tolist())
    probas = model.predict_proba(subset["clean_text"].tolist())

    subset["ml_sentiment"]  = [_label_map[p] for p in preds]
    subset["ml_confidence"] = probas.max(axis=1).round(4)
    subset["positive_score"] = probas[:, 2].round(4)
    subset["negative_score"] = probas[:, 0].round(4)
    return subset


def _sentiment_score(sentiment_dist: dict, total: int) -> float:
    """Weighted sentiment score: Pos=1, Neu=0.5, Neg=0 → 0–100."""
    if not total:
        return 0.0
    pos = sentiment_dist.get("Positive", 0)
    neu = sentiment_dist.get("Neutral",  0)
    return round((pos * 1.0 + neu * 0.5) / total * 100, 2)


def analyze_product(
    product_name: str,
    platforms: Optional[list[str]] = None,
    top_n: int = 5,
) -> dict:
    """
    Full analysis for a single product across one or more platforms.

    NOTE: Operates on the deduplicated dataset. If the underlying dataset has
    very few unique reviews (as with the current generated dataset), the results
    will not be product-specific — all products share the same recycled texts.
    Regenerate with unique per-product reviews for meaningful analysis.
    """
    df    = load_data()
    model = get_model()

    subset = df[df["product_name"] == product_name].copy()
    if platforms:
        subset = subset[subset["platform"].isin(platforms)]

    if subset.empty:
        return {"error": f"No reviews found for '{product_name}'"}

    subset = _attach_ml_predictions(subset, model)

    # Overall stats
    total         = len(subset)
    sentiment_dist = subset["ml_sentiment"].value_counts().to_dict()
    rating_dist    = subset["rating"].value_counts().sort_index().to_dict()
    avg_rating     = round(subset["rating"].mean(), 2)
    avg_confidence = round(subset["ml_confidence"].mean(), 4)
    overall_score  = _sentiment_score(sentiment_dist, total)

    # Top positive reviews
    review_cols = [
        "review_id", "platform", "username", "rating", "review_text",
        "ml_sentiment", "ml_confidence", "review_date", "helpful_votes",
    ]
    top_positive = (
        subset[subset["ml_sentiment"] == "Positive"]
        .nlargest(top_n, "positive_score")[review_cols]
        .to_dict(orient="records")
    )
    top_negative = (
        subset[subset["ml_sentiment"] == "Negative"]
        .nlargest(top_n, "negative_score")[review_cols]
        .to_dict(orient="records")
    )

    # Per-platform breakdown
    platform_breakdown = []
    for platform, grp in subset.groupby("platform"):
        p_total = len(grp)
        p_sent  = grp["ml_sentiment"].value_counts().to_dict()
        platform_breakdown.append({
            "platform":             platform,
            "total_reviews":        p_total,
            "avg_rating":           round(grp["rating"].mean(), 2),
            "sentiment_distribution": p_sent,
            "sentiment_score":      _sentiment_score(p_sent, p_total),
        })

    # Monthly trend
    subset_copy = subset.copy()
    subset_copy["month"] = (
        pd.to_datetime(subset_copy["review_date"], errors="coerce")
        .dt.to_period("M")
        .astype(str)
    )
    monthly_trend = (
        subset_copy.groupby(["month", "ml_sentiment"])
        .size()
        .unstack(fill_value=0)
        .reset_index()
        .rename(columns={"month": "period"})
        .to_dict(orient="records")
    )

    return {
        "product_name":           product_name,
        "category":               subset["category"].iloc[0],
        "total_reviews":          total,
        "avg_rating":             avg_rating,
        "overall_sentiment_score": overall_score,
        "avg_model_confidence":   avg_confidence,
        "sentiment_distribution": sentiment_dist,
        "rating_distribution":    {str(k): v for k, v in rating_dist.items()},
        "top_positive_reviews":   top_positive,
        "top_negative_reviews":   top_negative,
        "platform_breakdown":     platform_breakdown,
        "monthly_trend":          monthly_trend,
    }


def compare_products(product_names: list[str]) -> list[dict]:
    """Lightweight comparison summary for multiple products."""
    results = []
    for name in product_names:
        analysis = analyze_product(name)
        if "error" not in analysis:
            results.append({
                "product_name":           name,
                "category":               analysis["category"],
                "total_reviews":          analysis["total_reviews"],
                "avg_rating":             analysis["avg_rating"],
                "overall_sentiment_score": analysis["overall_sentiment_score"],
                "sentiment_distribution": analysis["sentiment_distribution"],
            })
    return results


def search_reviews(
    query: str,
    product_name: Optional[str] = None,
    platform: Optional[str] = None,
    sentiment: Optional[str] = None,
    limit: int = 20,
) -> list[dict]:
    """Keyword search across review texts with optional filters."""
    df   = load_data()
    mask = df["review_text"].str.contains(query, case=False, na=False)
    if product_name:
        mask &= df["product_name"] == product_name
    if platform:
        mask &= df["platform"] == platform
    if sentiment:
        mask &= df["sentiment"].str.lower() == sentiment.lower()

    results = df[mask].head(limit)
    return results[[
        "review_id", "product_name", "platform", "username",
        "rating", "review_text", "sentiment", "review_date",
    ]].to_dict(orient="records")