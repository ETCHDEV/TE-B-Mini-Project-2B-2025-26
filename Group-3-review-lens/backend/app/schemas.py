from pydantic import BaseModel, Field
from typing import Optional


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1, description="List of review texts to classify")


class AnalyzeProductRequest(BaseModel):
    product_name: str = Field(..., description="Exact product name")
    platforms: Optional[list[str]] = Field(None, description="Filter to specific platforms")
    top_n: int = Field(5, ge=1, le=20, description="Number of top/worst reviews to return")


class CompareProductsRequest(BaseModel):
    product_names: list[str] = Field(..., min_length=2, max_length=10)


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    product_name: Optional[str] = None
    platform: Optional[str] = None
    sentiment: Optional[str] = None
    limit: int = Field(20, ge=1, le=100)


class AIInsightRequest(BaseModel):
    product_name: str
    analysis_data: dict
    question: Optional[str] = Field(
        None,
        description="Optional specific question. If None, returns full AI summary."
    )


# ---------------------------------------------------------------------------
# Response Models
# ---------------------------------------------------------------------------

class SentimentResult(BaseModel):
    sentiment: str
    confidence: float
    scores: dict[str, float]


class PredictResponse(BaseModel):
    results: list[SentimentResult]
    total: int


class PlatformBreakdown(BaseModel):
    platform: str
    total_reviews: int
    avg_rating: float
    sentiment_distribution: dict[str, int]
    sentiment_score: float


class ReviewItem(BaseModel):
    review_id: str
    platform: str
    username: str
    rating: float
    review_text: str
    ml_sentiment: str
    ml_confidence: float
    review_date: str
    helpful_votes: int


class ProductAnalysis(BaseModel):
    product_name: str
    category: str
    total_reviews: int
    avg_rating: float
    overall_sentiment_score: float
    avg_model_confidence: float
    sentiment_distribution: dict[str, int]
    rating_distribution: dict[str, int]
    top_positive_reviews: list[dict]
    top_negative_reviews: list[dict]
    platform_breakdown: list[PlatformBreakdown]
    monthly_trend: list[dict]


class CompareItem(BaseModel):
    product_name: str
    category: str
    total_reviews: int
    avg_rating: float
    overall_sentiment_score: float
    sentiment_distribution: dict[str, int]


class AIInsightResponse(BaseModel):
    product_name: str
    insight: str
    model_used: str
