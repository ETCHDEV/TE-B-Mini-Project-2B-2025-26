import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder

print("Loading Dataset...")

# Load local dataset
train_df = pd.read_csv("train.csv", header=None)
test_df = pd.read_csv("test.csv", header=None)

# Rename columns
train_df.columns = ["Category", "Title", "Description"]
test_df.columns = ["Category", "Title", "Description"]

# Combine title + description
train_df["Text"] = train_df["Title"] + " " + train_df["Description"]
test_df["Text"] = test_df["Title"] + " " + test_df["Description"]

print("Dataset Loaded Successfully!")

# Encode labels
label_encoder = LabelEncoder()
train_df["Category"] = label_encoder.fit_transform(train_df["Category"])
test_df["Category"] = label_encoder.transform(test_df["Category"])

# TF-IDF Vectorization
vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)

X_train = vectorizer.fit_transform(train_df["Text"])
X_test = vectorizer.transform(test_df["Text"])

y_train = train_df["Category"]
y_test = test_df["Category"]

print("Training Model...")

# Train Naive Bayes Classifier
model = MultinomialNB()
model.fit(X_train, y_train)

print("Model Training Completed!")

# Predictions
y_pred = model.predict(X_test)

# Evaluation
print("\nModel Evaluation Results:\n")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# -------- Ranking Example --------
print("\nTop 5 Important News (Sample Ranking):\n")

# Ranking based on article length
test_df["Length"] = test_df["Text"].apply(len)
ranked_news = test_df.sort_values(by="Length", ascending=False)

for i, row in ranked_news.head(5).iterrows():
    category_name = label_encoder.inverse_transform([row["Category"]])[0]
    print(f"Category: {category_name}")
    print(f"Title: {row['Title']}")
    print("-" * 80)