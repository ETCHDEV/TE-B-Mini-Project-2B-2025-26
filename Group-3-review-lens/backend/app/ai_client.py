"""
OpenRouter AI Client
====================
Uses OpenAI SDK pointed at OpenRouter to generate:
  - Natural-language product summaries from sentiment analysis data
  - Answers to specific questions about a product's reviews
  - Competitive comparison insights
"""

import os
import logging
from typing import Optional

from openai import OpenAI

logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "qwen/qwen3-vl-30b-a3b-thinking"           # fast + cheap; swap freely
FALLBACK_MODEL = "openai/gpt-oss-20b:free"     # free tier fallback


def _get_client() -> OpenAI:
    if not OPENROUTER_API_KEY:
        raise ValueError(
            "OPENROUTER_API_KEY environment variable not set. "
            "Add it to your .env or export it before starting the server."
        )
    return OpenAI(
        base_url=OPENROUTER_BASE_URL,
        api_key=OPENROUTER_API_KEY,
    )


# ---------------------------------------------------------------------------
# Prompt builders
# ---------------------------------------------------------------------------

def _build_analysis_prompt(analysis: dict, question: Optional[str]) -> str:
    """Build a concise but information-rich prompt from analysis data."""
    pd = analysis
    sent = pd.get("sentiment_distribution", {})
    platforms = pd.get("platform_breakdown", [])

    platform_lines = "\n".join(
        f"  - {p['platform']}: {p['total_reviews']} reviews, "
        f"avg rating {p['avg_rating']}, sentiment score {p['sentiment_score']}%"
        for p in platforms
    )

    pos_reviews = "\n".join(
        f'  [{r["platform"]}] "{r["review_text"][:120]}..."'
        for r in pd.get("top_positive_reviews", [])[:3]
    )
    neg_reviews = "\n".join(
        f'  [{r["platform"]}] "{r["review_text"][:120]}..."'
        for r in pd.get("top_negative_reviews", [])[:3]
    )

    context = f"""
Product: {pd.get("product_name")} ({pd.get("category")})
Total Reviews Analyzed: {pd.get("total_reviews")}
Average Rating: {pd.get("avg_rating")} / 5
Overall Sentiment Score: {pd.get("overall_sentiment_score")}%

Sentiment Distribution:
  - Positive: {sent.get("Positive", 0)}
  - Neutral:  {sent.get("Neutral", 0)}
  - Negative: {sent.get("Negative", 0)}

Platform Breakdown:
{platform_lines}

Sample Top Positive Reviews:
{pos_reviews}

Sample Top Negative Reviews:
{neg_reviews}
""".strip()

    if question:
        return (
            f"You are a product review analyst. Based on the following data, "
            f"answer this question concisely and factually:\n\n"
            f"QUESTION: {question}\n\nDATA:\n{context}"
        )

    return (
        "You are a senior product review analyst. Based on the following aggregated "
        "multi-platform review data, provide a concise, structured insight report covering:\n"
        "1. Overall customer sentiment summary\n"
        "2. Key strengths praised by customers\n"
        "3. Main pain points or complaints\n"
        "4. Platform-specific observations (if notable)\n"
        "5. Purchasing recommendation (1-2 sentences)\n\n"
        f"DATA:\n{context}\n\n"
        "Keep the report under 300 words. Be direct and data-driven."
    )


def _build_comparison_prompt(products: list[dict]) -> str:
    lines = []
    for p in products:
        sent = p.get("sentiment_distribution", {})
        lines.append(
            f"- {p['product_name']} ({p['category']}): "
            f"avg rating {p['avg_rating']}, sentiment score {p['overall_sentiment_score']}%, "
            f"Pos/Neu/Neg = {sent.get('Positive',0)}/{sent.get('Neutral',0)}/{sent.get('Negative',0)}"
        )

    return (
        "You are a product comparison analyst. Compare the following products based on "
        "customer review data and provide:\n"
        "1. Which product has the best overall customer satisfaction and why\n"
        "2. Notable differences between the products\n"
        "3. A final recommendation of which to buy\n\n"
        "Products:\n" + "\n".join(lines) +
        "\n\nKeep it under 200 words. Be concise and decisive."
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_product_insight(
    analysis: dict,
    question: Optional[str] = None,
    model: str = DEFAULT_MODEL,
) -> str:
    """
    Generate an AI-powered insight for a product analysis.
    Returns the insight text.
    """
    client = _get_client()
    prompt = _build_analysis_prompt(analysis, question)

    logger.info(f"Calling OpenRouter model={model} for product={analysis.get('product_name')}")

    try:
        response = client.chat.completions.create(
            model=model,
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        logger.warning(f"Primary model {model} failed: {e}. Trying fallback...")
        # Try fallback model
        response = client.chat.completions.create(
            model=FALLBACK_MODEL,
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()


def generate_comparison_insight(
    products: list[dict],
    model: str = DEFAULT_MODEL,
) -> str:
    """Generate a comparative AI insight across multiple products."""
    client = _get_client()
    prompt = _build_comparison_prompt(products)

    logger.info(f"Calling OpenRouter comparison for {[p['product_name'] for p in products]}")

    response = client.chat.completions.create(
        model=model,
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()
