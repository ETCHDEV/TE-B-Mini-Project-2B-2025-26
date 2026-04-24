"""
Model Comparison Engine
=======================
Trains, evaluates, and compares multiple classifiers for sentiment analysis.

Models compared:
  1.  Logistic Regression          — strong linear baseline
  2.  SGD Classifier               — fast linear, good for large text data
  3.  Multinomial Naive Bayes      — classic NLP baseline
  4.  Complement Naive Bayes       — improved NB for imbalanced text classes
  5.  Linear SVC                   — SVM for text, usually very competitive
  6.  Random Forest                — ensemble of decision trees
  7.  Gradient Boosting            — boosted trees (slower but powerful)
  8.  Decision Tree                — simple interpretable baseline
  9.  K-Nearest Neighbors          — distance-based, no assumptions
  10. Ridge Classifier             — L2-regularized linear classifier

Each model is wrapped in a Pipeline with TF-IDF.
Best model is selected by macro-averaged F1 score and saved for production use.

FIX: Added deduplication on review_text before train/test split to prevent
     data leakage caused by duplicate reviews in the dataset generator.
"""

import logging
import pickle
import re
import time
import json
import warnings
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, RidgeClassifier, SGDClassifier
from sklearn.metrics import (
    classification_report, f1_score, accuracy_score,
    precision_score, recall_score, confusion_matrix,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.naive_bayes import ComplementNB, MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
from sklearn.tree import DecisionTreeClassifier

logger = logging.getLogger(__name__)

DATA_PATH         = Path(__file__).parent.parent / "data" / "reviews.csv"
MODELS_DIR        = Path(__file__).parent.parent / "data" / "models"
BEST_MODEL_PATH   = MODELS_DIR / "best_model.pkl"
COMPARISON_REPORT = MODELS_DIR / "comparison_report.json"

MODELS_DIR.mkdir(parents=True, exist_ok=True)

LABEL_MAP   = {"Negative": 0, "Neutral": 1, "Positive": 2}
LABEL_NAMES = ["Negative", "Neutral", "Positive"]
INV_LABEL   = {v: k for k, v in LABEL_MAP.items()}

# Minimum unique samples required for reliable evaluation
MIN_UNIQUE_SAMPLES = 200


# ---------------------------------------------------------------------------
# Shared TF-IDF config  (same across all models for fair comparison)
# ---------------------------------------------------------------------------

def _tfidf(min_df: int = 2) -> TfidfVectorizer:
    return TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=15_000,
        min_df=min_df,
        sublinear_tf=True,
        strip_accents="unicode",
    )


# ---------------------------------------------------------------------------
# Model zoo
# ---------------------------------------------------------------------------

def _get_model_zoo(small_dataset: bool = False) -> dict[str, Pipeline]:
    """
    Returns a dict of name → sklearn Pipeline.
    LinearSVC and RidgeClassifier don't expose predict_proba natively,
    so they're wrapped with CalibratedClassifierCV.

    Args:
        small_dataset: If True, uses min_df=1 and more regularization
                       to avoid overfitting on tiny datasets.
    """
    min_df = 1 if small_dataset else 2
    # Stronger regularization for small datasets
    lr_C     = 0.5  if small_dataset else 1.5
    svc_C    = 0.5  if small_dataset else 1.0
    nb_alpha = 1.0  if small_dataset else 0.5
    sgd_alpha = 1e-3 if small_dataset else 1e-4
    ridge_alpha = 2.0 if small_dataset else 1.0

    return {
        "Logistic Regression": Pipeline([
            ("tfidf", _tfidf(min_df)),
            ("clf",   LogisticRegression(
                C=lr_C, max_iter=500, class_weight="balanced",
                solver="lbfgs", random_state=42,
            )),
        ]),

        "SGD Classifier": Pipeline([
            ("tfidf", _tfidf(min_df)),
            ("clf",   SGDClassifier(
                loss="modified_huber",
                alpha=sgd_alpha, max_iter=200,
                class_weight="balanced", random_state=42, n_jobs=-1,
            )),
        ]),

        "Multinomial NB": Pipeline([
            ("tfidf", _tfidf(min_df)),
            ("clf",   MultinomialNB(alpha=nb_alpha)),
        ]),

        "Complement NB": Pipeline([
            ("tfidf", _tfidf(min_df)),
            ("clf",   ComplementNB(alpha=nb_alpha)),
        ]),

        "Linear SVC": Pipeline([
            ("tfidf", _tfidf(min_df)),
            ("clf",   CalibratedClassifierCV(
                LinearSVC(C=svc_C, max_iter=2000, class_weight="balanced", random_state=42),
                cv=3,
            )),
        ]),

        "Ridge Classifier": Pipeline([
            ("tfidf", _tfidf(min_df)),
            ("clf",   CalibratedClassifierCV(
                RidgeClassifier(alpha=ridge_alpha, class_weight="balanced"),
                cv=3,
            )),
        ]),

        "Random Forest": Pipeline([
            ("tfidf", _tfidf(min_df)),
            ("clf",   RandomForestClassifier(
                n_estimators=100,
                max_depth=10 if small_dataset else 30,
                min_samples_leaf=3 if small_dataset else 2,
                class_weight="balanced", random_state=42, n_jobs=-1,
            )),
        ]),

        "Gradient Boosting": Pipeline([
            ("tfidf", _tfidf(min_df)),
            ("clf",   GradientBoostingClassifier(
                n_estimators=100 if small_dataset else 150,
                learning_rate=0.1, max_depth=3 if small_dataset else 5,
                subsample=0.8, random_state=42,
            )),
        ]),

        "Decision Tree": Pipeline([
            ("tfidf", _tfidf(min_df)),
            ("clf",   DecisionTreeClassifier(
                max_depth=5 if small_dataset else 20,
                min_samples_leaf=5,
                class_weight="balanced", random_state=42,
            )),
        ]),

        "KNN": Pipeline([
            ("tfidf", _tfidf(min_df)),
            ("clf",   KNeighborsClassifier(
                n_neighbors=7, metric="cosine", algorithm="brute", n_jobs=-1,
            )),
        ]),
    }


# ---------------------------------------------------------------------------
# Preprocessing  (inline — no NLTK download needed)
# ---------------------------------------------------------------------------

_STOPWORDS = {
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


def _preprocess(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    tokens = [w for w in text.split() if w not in _STOPWORDS and len(w) > 2]
    return " ".join(tokens)


# ---------------------------------------------------------------------------
# Dataset preparation  ← KEY FIX: deduplication happens here
# ---------------------------------------------------------------------------

def _prepare_data() -> tuple[pd.Series, pd.Series, dict]:
    """
    Load, deduplicate, and preprocess the dataset.

    CRITICAL: Deduplicates on review_text BEFORE any train/test split.
    Without this, duplicate rows leak test samples into training, causing
    artificially perfect scores (all models hit 1.0000).

    Returns:
        X: cleaned text series
        y: integer label series
        info: dict with dataset quality stats
    """
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()
    df["sentiment"] = df["sentiment"].str.strip().str.capitalize()
    df = df[df["sentiment"].isin(LABEL_MAP)].copy()

    total_before = len(df)

    # ------------------------------------------------------------------ #
    #  DEDUPLICATION FIX                                                  #
    #  The dataset generator produces many rows with identical            #
    #  review_text but different metadata (product, platform, etc.).      #
    #  Keeping duplicates means train and test sets share identical       #
    #  texts → all models score 1.0000 (data leakage, not real skill).   #
    # ------------------------------------------------------------------ #
    df = df.drop_duplicates(subset=["review_text"]).copy()
    total_after = len(df)
    duplicates_removed = total_before - total_after

    if duplicates_removed > 0:
        logger.warning(
            f"⚠️  DEDUPLICATION: Removed {duplicates_removed:,} duplicate rows "
            f"({total_before:,} → {total_after:,} unique reviews). "
            "Duplicate reviews in train/test would cause data leakage and "
            "artificially perfect scores."
        )

    if total_after < MIN_UNIQUE_SAMPLES:
        logger.warning(
            f"⚠️  SMALL DATASET: Only {total_after} unique reviews after deduplication. "
            f"Minimum recommended: {MIN_UNIQUE_SAMPLES}. "
            "Evaluation metrics will be unreliable. Regenerate the dataset with "
            "more diverse, unique reviews for trustworthy results."
        )

    df["clean_text"] = df["review_text"].apply(_preprocess)
    df["label"] = df["sentiment"].map(LABEL_MAP)

    info = {
        "total_before_dedup": total_before,
        "total_after_dedup":  total_after,
        "duplicates_removed": duplicates_removed,
        "is_small_dataset":   total_after < MIN_UNIQUE_SAMPLES,
        "class_distribution": df["sentiment"].value_counts().to_dict(),
    }

    return df["clean_text"], df["label"], info


# ---------------------------------------------------------------------------
# Single model evaluation  (train/test split)
# ---------------------------------------------------------------------------

def _evaluate_model(
    name: str,
    model: Pipeline,
    X_train, X_test,
    y_train, y_test,
) -> dict:
    t0 = time.perf_counter()
    model.fit(X_train, y_train)
    train_time = round(time.perf_counter() - t0, 3)

    t0 = time.perf_counter()
    y_pred = model.predict(X_test)
    infer_time = round((time.perf_counter() - t0) / len(X_test) * 1000, 4)

    # Train accuracy — large gap vs test accuracy indicates overfitting
    y_train_pred = model.predict(X_train)
    train_accuracy = round(accuracy_score(y_train, y_train_pred), 4)

    report = classification_report(
        y_test, y_pred, target_names=LABEL_NAMES, output_dict=True, zero_division=0
    )
    cm = confusion_matrix(y_test, y_pred).tolist()

    test_accuracy = round(accuracy_score(y_test, y_pred), 4)
    overfit_gap   = round(train_accuracy - test_accuracy, 4)

    return {
        "model_name":          name,
        "accuracy":            test_accuracy,
        "train_accuracy":      train_accuracy,
        "overfit_gap":         overfit_gap,
        "macro_f1":            round(f1_score(y_test, y_pred, average="macro",     zero_division=0), 4),
        "weighted_f1":         round(f1_score(y_test, y_pred, average="weighted",  zero_division=0), 4),
        "macro_precision":     round(precision_score(y_test, y_pred, average="macro", zero_division=0), 4),
        "macro_recall":        round(recall_score(y_test, y_pred, average="macro",    zero_division=0), 4),
        "per_class":           {
            cls: {
                "precision": round(report[cls]["precision"], 4),
                "recall":    round(report[cls]["recall"],    4),
                "f1_score":  round(report[cls]["f1-score"],  4),
                "support":   int(report[cls]["support"]),
            }
            for cls in LABEL_NAMES
        },
        "confusion_matrix":    cm,
        "train_time_sec":      train_time,
        "infer_ms_per_sample": infer_time,
    }


# ---------------------------------------------------------------------------
# Cross-validation on winner
# ---------------------------------------------------------------------------

def _cross_validate_winner(model: Pipeline, X, y, cv: int = 5) -> dict:
    # For very small datasets, reduce CV folds to ensure enough samples per fold
    min_class_count = y.value_counts().min()
    cv = min(cv, min_class_count)
    if cv < 2:
        logger.warning("Dataset too small for cross-validation. Skipping CV.")
        return {"cv_folds": 0, "cv_f1_mean": None, "cv_f1_std": None, "cv_f1_scores": []}

    logger.info(f"Running {cv}-fold CV on winning model...")
    scores = cross_val_score(
        model, X, y,
        cv=StratifiedKFold(n_splits=cv, shuffle=True, random_state=42),
        scoring="f1_macro", n_jobs=-1,
    )
    return {
        "cv_folds":     cv,
        "cv_f1_mean":   round(float(scores.mean()), 4),
        "cv_f1_std":    round(float(scores.std()),  4),
        "cv_f1_scores": [round(float(s), 4) for s in scores],
    }


# ---------------------------------------------------------------------------
# Main comparison runner
# ---------------------------------------------------------------------------

def run_comparison(save: bool = True) -> dict:
    """
    Train and evaluate all models. Save best model and full report.
    Returns the comparison report dict.
    """
    logger.info("=" * 60)
    logger.info("STARTING MODEL COMPARISON")
    logger.info("=" * 60)

    X, y, data_info = _prepare_data()
    small = data_info["is_small_dataset"]

    logger.info(f"Unique samples: {len(X)} | classes: {y.value_counts().to_dict()}")
    if data_info["duplicates_removed"] > 0:
        logger.info(f"Removed {data_info['duplicates_removed']:,} duplicate reviews before splitting.")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    logger.info(f"Train: {len(X_train)} | Test: {len(X_test)}")

    zoo     = _get_model_zoo(small_dataset=small)
    results = []
    trained = {}

    for name, model in zoo.items():
        logger.info(f"  Training: {name} ...")
        try:
            result = _evaluate_model(name, model, X_train, X_test, y_train, y_test)
            results.append(result)
            trained[name] = model
            logger.info(
                f"    ✅ test_acc={result['accuracy']} | train_acc={result['train_accuracy']} "
                f"| overfit_gap={result['overfit_gap']} | macro_f1={result['macro_f1']}"
            )
        except Exception as e:
            logger.error(f"    ❌ {name} failed: {e}")

    # Sort by macro F1 (primary), then accuracy (tiebreak)
    results.sort(key=lambda r: (r["macro_f1"], r["accuracy"]), reverse=True)

    best_name  = results[0]["model_name"]
    best_model = trained[best_name]
    logger.info(f"\n🏆 Best model: {best_name} (macro_f1={results[0]['macro_f1']})")

    # Cross-validate the winner on the full (deduplicated) dataset
    cv_stats = _cross_validate_winner(best_model, X, y)

    # Re-train winner on full deduplicated dataset for production
    logger.info("Re-training winner on full dataset for production...")
    best_model.fit(X, y)

    if save:
        with open(BEST_MODEL_PATH, "wb") as f:
            pickle.dump(best_model, f)
        logger.info(f"Best model saved → {BEST_MODEL_PATH}")

    report = {
        "best_model":       best_name,
        "best_macro_f1":    results[0]["macro_f1"],
        "best_accuracy":    results[0]["accuracy"],
        "cross_validation": cv_stats,
        "rankings":         results,
        "dataset_info": {
            "total_samples":       int(len(X)),
            "train_samples":       int(len(X_train)),
            "test_samples":        int(len(X_test)),
            "duplicates_removed":  data_info["duplicates_removed"],
            "class_distribution": {
                INV_LABEL[k]: int(v) for k, v in y.value_counts().items()
            },
        },
    }

    if save:
        with open(COMPARISON_REPORT, "w") as f:
            json.dump(report, f, indent=2)
        logger.info(f"Comparison report saved → {COMPARISON_REPORT}")

    _print_leaderboard(results, data_info)
    return report


def _print_leaderboard(results: list[dict], data_info: dict):
    print("\n" + "=" * 95)
    print(
        f"{'RANK':<5} {'MODEL':<25} {'TEST ACC':>10} {'MACRO F1':>10} "
        f"{'W-F1':>10} {'TRAIN ACC':>10} {'OVERFIT':>10}"
    )
    print("-" * 95)
    for i, r in enumerate(results, 1):
        medal = "🥇" if i == 1 else ("🥈" if i == 2 else ("🥉" if i == 3 else f"#{i} "))
        # Dynamic threshold: small datasets naturally have larger train-test gaps
        # < 500 samples  → gap up to 0.30 is normal (high variance, few samples)
        # 500–2000        → gap up to 0.15 is normal
        # > 2000          → gap > 0.10 is worth flagging
        n = data_info["total_after_dedup"]
        overfit_threshold = 0.30 if n < 500 else (0.15 if n < 2000 else 0.10)
        gap_flag = " ⚠️" if r["overfit_gap"] > overfit_threshold else ""
        print(
            f"{medal:<5} {r['model_name']:<25} "
            f"{r['accuracy']:>10.4f} {r['macro_f1']:>10.4f} "
            f"{r['weighted_f1']:>10.4f} {r['train_accuracy']:>10.4f} "
            f"{r['overfit_gap']:>10.4f}{gap_flag}"
        )
    print("=" * 95)

    n = data_info["total_after_dedup"]
    threshold = 0.30 if n < 500 else (0.15 if n < 2000 else 0.10)
    note = "normal for < 500 samples" if n < 500 else ("normal for < 2000 samples" if n < 2000 else "worth investigating")
    print(f"\n  Dataset: {n} unique reviews")
    print(f"  Overfit ⚠️  threshold: gap > {threshold:.2f}  ({note})")
    print(f"  A large train/test gap on small datasets reflects variance, not necessarily overfitting.")
    print(f"  Use cross-validation F1 as the primary reliability metric for small datasets.")
    if data_info["duplicates_removed"] > 0:
        print(f"\n⚠️  {data_info['duplicates_removed']:,} duplicate reviews were removed before evaluation.")
    if data_info["is_small_dataset"]:
        print(f"ℹ️  {n} unique reviews — functional for testing but add more data to reduce variance.")


# ---------------------------------------------------------------------------
# Load best model (used by pipeline.py)
# ---------------------------------------------------------------------------

def load_best_model():
    if not BEST_MODEL_PATH.exists():
        raise FileNotFoundError("No trained model found. Run: python -m ml.model_comparison")
    with open(BEST_MODEL_PATH, "rb") as f:
        return pickle.load(f)


def load_comparison_report() -> Optional[dict]:
    if not COMPARISON_REPORT.exists():
        return None
    with open(COMPARISON_REPORT) as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(message)s",
    )

    force = "--force" in sys.argv

    if not force and BEST_MODEL_PATH.exists():
        print("✅ Best model already trained. Use --force to retrain.")
        report = load_comparison_report()
        if report:
            print(f"   Best model: {report['best_model']}")
            print(f"   Macro F1:   {report['best_macro_f1']}")
            di = report.get("dataset_info", {})
            if di.get("duplicates_removed", 0) > 0:
                print(f"   ⚠️  {di['duplicates_removed']:,} duplicate reviews were removed during training.")
    else:
        report = run_comparison(save=True)
        print(f"\n🏆 Winner: {report['best_model']}")
        print(f"   Macro F1:   {report['best_macro_f1']}")
        print(f"   Accuracy:   {report['best_accuracy']}")
        cv = report["cross_validation"]
        if cv["cv_f1_mean"] is not None:
            print(f"   {cv['cv_folds']}-Fold CV F1: {cv['cv_f1_mean']} ± {cv['cv_f1_std']}")