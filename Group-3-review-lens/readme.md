# Review Lens

A project that analyzes customer reviews from 7 e-commerce platforms across 60 products using machine learning.

---

## What it does

- Classifies reviews as **Positive**, **Neutral**, or **Negative** using a local ML model
- Compares 10 different classifiers and automatically picks the best one
- Provides per-product analytics: sentiment scores, rating distribution, top reviews, platform breakdown, and monthly trends
- Optional AI-powered summaries via OpenRouter

---

## Setup

```bash
# Install dependencies
uv sync

# Add your OpenRouter API key (optional, only needed for AI endpoints)
cp .env.example .env

# Start the server
uv run python run.py --reload
```

API docs available at `http://localhost:8000/docs`

---

## Running Tests

```bash
uv run pytest tests/ -v
```