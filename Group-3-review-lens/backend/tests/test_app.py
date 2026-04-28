"""
Tests — Multi-Platform Review Analyzer
Run with: uv run pytest tests/ -v
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient

from app.main import app
from ml.pipeline import (
    clean_text, tokenize, preprocess,
    load_data, get_model, predict_sentiment,
    analyze_product, compare_products, search_reviews,
    get_products, get_platforms,
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# ML Pipeline unit tests
# ---------------------------------------------------------------------------

class TestTextPreprocessing:
    def test_clean_text_lowercases(self):
        assert clean_text("HELLO World!") == "hello world"

    def test_clean_text_removes_punctuation(self):
        assert "!" not in clean_text("Amazing!!!")

    def test_clean_text_removes_urls(self):
        result = clean_text("Visit https://example.com for more info")
        assert "http" not in result

    def test_tokenize_removes_stopwords(self):
        tokens = tokenize("this is a very good product")
        assert "this" not in tokens
        assert "is" not in tokens
        assert "good" in tokens
        assert "product" in tokens

    def test_tokenize_min_length(self):
        tokens = tokenize("it is so good")
        for t in tokens:
            assert len(t) > 2

    def test_preprocess_returns_string(self):
        result = preprocess("Absolutely amazing product! Works perfectly.")
        assert isinstance(result, str)
        assert len(result) > 0


class TestDataLoading:
    def test_load_data_returns_dataframe(self):
        df = load_data()
        assert len(df) > 0

    def test_required_columns_present(self):
        df = load_data()
        required = ["product_name", "platform", "rating", "review_text", "sentiment"]
        for col in required:
            assert col in df.columns, f"Missing column: {col}"

    def test_sentiment_values(self):
        df = load_data()
        valid = {"Positive", "Neutral", "Negative"}
        assert set(df["sentiment"].unique()).issubset(valid)

    def test_platforms_count(self):
        platforms = get_platforms()
        assert len(platforms) == 8

    def test_products_count(self):
        products = get_products()
        assert len(products) >= 50


class TestSentimentModel:
    def test_model_loads(self):
        model = get_model()
        assert model is not None

    def test_predict_positive(self):
        results = predict_sentiment(["Amazing product! Absolutely love it. Best purchase ever."])
        assert results[0]["sentiment"] == "Positive"
        assert results[0]["confidence"] > 0.5

    def test_predict_negative(self):
        results = predict_sentiment(["Terrible quality. Broke after 2 days. Worst product ever."])
        assert results[0]["sentiment"] == "Negative"
        assert results[0]["confidence"] > 0.5

    def test_predict_returns_scores(self):
        results = predict_sentiment(["Decent product, nothing special."])
        r = results[0]
        assert "scores" in r
        assert "Positive" in r["scores"]
        assert "Negative" in r["scores"]
        assert "Neutral" in r["scores"]
        assert abs(sum(r["scores"].values()) - 1.0) < 0.01  # probabilities sum to 1

    def test_predict_batch(self):
        texts = ["Great!", "Terrible!", "Okay I guess."]
        results = predict_sentiment(texts)
        assert len(results) == 3


class TestProductAnalysis:
    def test_analyze_known_product(self):
        products = get_products()
        result = analyze_product(products[0])
        assert "error" not in result
        assert result["total_reviews"] > 0
        assert "sentiment_distribution" in result
        assert "platform_breakdown" in result
        assert "top_positive_reviews" in result
        assert "top_negative_reviews" in result

    def test_analyze_unknown_product(self):
        result = analyze_product("Nonexistent Product XYZ 9999")
        assert "error" in result

    def test_analyze_with_platform_filter(self):
        products = get_products()
        result = analyze_product(products[0], platforms=["Amazon"])
        assert "error" not in result
        for pb in result["platform_breakdown"]:
            assert pb["platform"] == "Amazon"

    def test_compare_products(self):
        products = get_products()[:3]
        results = compare_products(products)
        assert len(results) == 3
        for r in results:
            assert "overall_sentiment_score" in r
            assert "avg_rating" in r

    def test_search_reviews(self):
        results = search_reviews("amazing", limit=5)
        assert len(results) <= 5
        for r in results:
            assert "review_text" in r


# ---------------------------------------------------------------------------
# API endpoint tests
# ---------------------------------------------------------------------------

class TestAPIRoot:
    def test_root(self):
        r = client.get("/")
        assert r.status_code == 200
        assert "endpoints" in r.json()

    def test_health(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


class TestMLEndpoints:
    def test_predict_endpoint(self):
        r = client.post("/api/v1/ml/predict", json={
            "texts": ["Amazing product! Very happy with it.", "Terrible, broke after one day."]
        })
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 2
        assert len(data["results"]) == 2

    def test_analyze_endpoint(self):
        products = get_products()
        r = client.post("/api/v1/ml/analyze", json={"product_name": products[0]})
        assert r.status_code == 200
        data = r.json()
        assert data["product_name"] == products[0]
        assert data["total_reviews"] > 0

    def test_analyze_endpoint_404(self):
        r = client.post("/api/v1/ml/analyze", json={"product_name": "Ghost Product 999"})
        assert r.status_code == 404

    def test_compare_endpoint(self):
        products = get_products()[:2]
        r = client.post("/api/v1/ml/compare", json={"product_names": products})
        assert r.status_code == 200
        assert r.json()["count"] == 2

    def test_get_product_endpoint(self):
        products = get_products()
        product = products[0].replace(" ", "%20")
        r = client.get(f"/api/v1/ml/product/{product}")
        assert r.status_code == 200


class TestDataEndpoints:
    def test_list_products(self):
        r = client.get("/api/v1/data/products")
        assert r.status_code == 200
        assert r.json()["count"] >= 50

    def test_list_platforms(self):
        r = client.get("/api/v1/data/platforms")
        assert r.status_code == 200
        data = r.json()
        assert data["count"] == 8
        assert "Amazon" in data["platforms"]
        assert "Flipkart" in data["platforms"]

    def test_list_categories(self):
        r = client.get("/api/v1/data/categories")
        assert r.status_code == 200
        assert r.json()["count"] > 0

    def test_dataset_stats(self):
        r = client.get("/api/v1/data/stats")
        assert r.status_code == 200
        data = r.json()
        assert data["total_reviews"] > 20000
        assert data["total_products"] >= 50
        assert data["total_platforms"] == 8

    def test_search_endpoint(self):
        r = client.post("/api/v1/data/search", json={"query": "battery", "limit": 10})
        assert r.status_code == 200
        data = r.json()
        assert "results" in data
        assert data["count"] <= 10
