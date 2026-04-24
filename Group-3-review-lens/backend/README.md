# 🛍️ Multi-Platform Product Review Sentiment Analyzer

A production-ready FastAPI backend that analyzes customer reviews from **8 e-commerce platforms** across **51 products** using a full NLP/ML pipeline with optional AI-powered insights via OpenRouter.

---

## 🏗️ Architecture

```
review-analyzer/
├── app/
│   ├── main.py          # FastAPI app, lifespan, middleware
│   ├── routers.py       # All API endpoints (/ml, /ai, /data)
│   ├── schemas.py       # Pydantic request/response models
│   └── ai_client.py     # OpenRouter LLM client
├── ml/
│   ├── pipeline.py      # NLP + ML core (cleaning, TF-IDF, classifier)
│   └── __init__.py
├── data/
│   └── reviews.csv      # 26,515 reviews across 8 platforms, 51 products
├── tests/
│   └── test_app.py      # Full pytest suite (unit + API)
├── run.py               # Convenience launcher
├── pyproject.toml       # uv / PEP 517 project config
└── .env.example         # Environment variable template
```

---

## ⚡ Quick Start

### 1. Install dependencies with uv

```bash
# Install uv if you haven't
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install all project dependencies
uv sync
```

### 2. Set your OpenRouter API key

```bash
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
# Get a free key at: https://openrouter.ai/keys
```

### 3. Run the server

```bash
# Development mode (with auto-reload)
uv run python run.py --reload

# Or directly with uvicorn
uv run uvicorn app.main:app --reload --port 8000
```

### 4. Open the interactive API docs

```
http://localhost:8000/docs      ← Swagger UI
http://localhost:8000/redoc     ← ReDoc
```

---

## 🤖 ML Pipeline

The ML pipeline runs **entirely locally** — no external API needed for analysis:

| Stage | Implementation |
|-------|---------------|
| Text Cleaning | Regex: lowercase, remove URLs, punctuation, digits |
| Tokenization | Whitespace split + stopword removal (inline list, no NLTK download) |
| Feature Extraction | TF-IDF Vectorizer (1-2 ngrams, 15k features, sublinear TF) |
| Classifier | Logistic Regression (C=1.5, balanced class weights) |
| Training Data | 26,515 reviews from the dataset (80/20 split) |
| Model Caching | Saved as `data/sentiment_model.pkl` after first run |

### Model Performance
Trained and evaluated on an 80/20 stratified split. Expected metrics:
- **Positive F1**: ~0.95+
- **Negative F1**: ~0.92+
- **Neutral F1**: ~0.75+ (fewer samples, harder class)

---

## 🌐 API Reference

### ML Endpoints — `/api/v1/ml`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/ml/predict` | Classify raw review texts |
| `POST` | `/ml/analyze` | Full product analysis |
| `GET`  | `/ml/product/{name}` | Same as analyze (GET) |
| `POST` | `/ml/compare` | Compare 2-10 products |

#### Example: Predict sentiment
```bash
curl -X POST http://localhost:8000/api/v1/ml/predict \
  -H "Content-Type: application/json" \
  -d '{"texts": ["Excellent product! Works perfectly.", "Terrible, broke after 2 days."]}'
```

#### Example: Analyze a product
```bash
curl -X POST http://localhost:8000/api/v1/ml/analyze \
  -H "Content-Type: application/json" \
  -d '{"product_name": "Samsung Galaxy S23 Ultra", "platforms": ["Amazon", "Flipkart"], "top_n": 5}'
```

---

### AI Endpoints — `/api/v1/ai`

> Requires `OPENROUTER_API_KEY` in your `.env`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/ai/insight` | LLM insight from pre-computed analysis data |
| `POST` | `/ai/analyze-and-insight` | ML analysis + AI summary in one call |
| `POST` | `/ai/compare-insight` | AI buying recommendation across products |

#### Example: Full analysis + AI insight
```bash
curl -X POST "http://localhost:8000/api/v1/ai/analyze-and-insight?product_name=Apple%20iPhone%2015%20Pro"
```

#### Example: Ask a specific question about a product
```bash
curl -X POST "http://localhost:8000/api/v1/ai/analyze-and-insight?product_name=Sony%20WH-1000XM5%20Headphones&question=What%20do%20customers%20say%20about%20battery%20life?"
```

---

### Data Endpoints — `/api/v1/data`

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/data/products` | List all 51 products |
| `GET`  | `/data/platforms` | List all 8 platforms |
| `GET`  | `/data/categories` | List all categories |
| `GET`  | `/data/stats` | Dataset-level statistics |
| `POST` | `/data/search` | Keyword search across reviews |

---

## 🧪 Running Tests

```bash
uv run pytest tests/ -v

# With coverage
uv run pytest tests/ -v --tb=short
```

Tests cover:
- Text preprocessing (clean, tokenize, preprocess)
- Data loading and column validation
- Sentiment model training and prediction
- Product analysis and comparison
- All API endpoints (ML + Data)

---

## 📊 Dataset

**File**: `data/reviews.csv`  
**Size**: 26,515 reviews

| Field | Description |
|-------|-------------|
| `review_id` | Unique review identifier |
| `product_name` | Product being reviewed |
| `category` | Product category (Smartphone, Laptop, Audio, etc.) |
| `platform` | E-commerce platform |
| `username` | Reviewer username |
| `rating` | Star rating (1–5) |
| `review_text` | Full review text |
| `sentiment` | Ground truth: Positive / Neutral / Negative |
| `verified_purchase` | Yes / No |
| `helpful_votes` | Number of helpful votes |
| `review_date` | Date of review (2022–2024) |

**Platforms**: Amazon, Flipkart, Meesho, Snapdeal, Myntra, Croma, Reliance Digital, Tata CLiQ  
**Categories**: Smartphone, Laptop, Audio, Television, Kitchen Appliance, Camera, Wearable, Home Appliance

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | For AI endpoints | — | Your OpenRouter API key |

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework |
| `uvicorn` | ASGI server |
| `openai` | OpenRouter client (OpenAI SDK) |
| `pandas` | Data manipulation |
| `scikit-learn` | TF-IDF + Logistic Regression |
| `pydantic` | Request/response validation |

All managed via **uv** — no pip needed.
