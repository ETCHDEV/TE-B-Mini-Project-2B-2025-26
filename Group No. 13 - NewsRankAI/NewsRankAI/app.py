from flask import Flask, render_template, request
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

app = Flask(__name__)

print("Loading dataset...")

# Load real dataset
df = pd.read_csv("train.csv")

# Combine Title + Description
df["text"] = df["Title"] + " " + df["Description"]

X = df["text"]
y = df["Class Index"]

# Convert text into numbers
vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
X_vectorized = vectorizer.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_vectorized, y, test_size=0.2, random_state=42
)

# Train model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Calculate accuracy
y_pred = model.predict(X_test)
accuracy = round(accuracy_score(y_test, y_pred) * 100, 2)

print(f"Model trained successfully! Accuracy: {accuracy}%")

# Category labels (AG News mapping)
categories = {
    1: "World",
    2: "Sports",
    3: "Business",
    4: "Sci/Tech"
}

@app.route('/')
def home():
    return render_template("index.html", accuracy=accuracy)

@app.route('/predict', methods=['POST'])
def predict():
    news = request.form['news']
    news_vectorized = vectorizer.transform([news])

    prediction = model.predict(news_vectorized)[0]
    probabilities = model.predict_proba(news_vectorized)[0]

    confidence = round(max(probabilities) * 100, 2)
    predicted_category = categories.get(prediction, "Unknown")

    return render_template(
        "result.html",
        news=news,
        prediction=predicted_category,
        confidence=confidence,
        accuracy=accuracy
    )

if __name__ == "__main__":
    app.run(debug=True, port=8000)