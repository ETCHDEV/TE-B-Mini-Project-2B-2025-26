"""
Multi-Platform Product Review Sentiment Analyzer
=================================================
FastAPI application entry point.

Start with:
    uv run uvicorn app.main:app --reload --port 8000

Or via the helper script:
    uv run python run.py
"""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import ml_router, ai_router, data_router, comparison_router

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan: warm-up ML model on startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting up — warming ML model...")
    try:
        from ml import load_data, get_model
        df = load_data()
        model = get_model()
        logger.info(
            f"✅ ML model ready. Dataset: {len(df)} reviews, "
            f"{df['product_name'].nunique()} products, "
            f"{df['platform'].nunique()} platforms."
        )
    except Exception as e:
        logger.error(f"❌ ML warm-up failed: {e}")
    yield
    logger.info("🛑 Shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Multi-Platform Product Review Sentiment Analyzer",
    description="""
## Overview
Analyzes customer reviews from **8 e-commerce platforms** (Amazon, Flipkart, Meesho,
Snapdeal, Myntra, Croma, Reliance Digital, Tata CLiQ) across **51 products** using:

- **NLP Pipeline**: Text cleaning → tokenization → TF-IDF → Logistic Regression
- **AI Insights**: OpenRouter LLM (GPT-4o-mini) for natural-language summaries
- **Analytics**: Sentiment distribution, platform breakdown, monthly trends, top/worst reviews

## Endpoint Groups
| Group | Prefix | Description |
|-------|--------|-------------|
| ML    | `/api/v1/ml`   | Pure ML sentiment analysis |
| AI    | `/api/v1/ai`   | LLM-powered insights via OpenRouter |
| Data  | `/api/v1/data` | Dataset metadata & search |

## Quick Start
```bash
# Analyze a product
POST /api/v1/ml/analyze
{"product_name": "Samsung Galaxy S23 Ultra"}

# Get AI insight
POST /api/v1/ai/analyze-and-insight?product_name=Samsung Galaxy S23 Ultra

# Classify custom reviews
POST /api/v1/ml/predict
{"texts": ["Amazing product!", "Terrible quality, broke in a week"]}
```
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 1)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} [{duration}ms]")
    return response


# ---------------------------------------------------------------------------
# Global error handler
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

API_PREFIX = "/api/v1"

app.include_router(ml_router,   prefix=API_PREFIX)
app.include_router(ai_router,   prefix=API_PREFIX)
app.include_router(data_router,       prefix=API_PREFIX)
app.include_router(comparison_router, prefix=API_PREFIX)


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------

@app.get("/", tags=["Root"])
def root():
    return {
        "name": "Multi-Platform Product Review Sentiment Analyzer",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "ml":   f"{API_PREFIX}/ml",
            "ai":   f"{API_PREFIX}/ai",
            "data": f"{API_PREFIX}/data",
        },
    }


@app.get("/health", tags=["Root"])
def health():
    return {"status": "ok"}
