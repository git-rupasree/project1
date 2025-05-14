from flask import Flask, request, jsonify
from textblob import TextBlob

app = Flask(__name__)

@app.route('/')
def home():
    return "Welcome to the Sentiment Analysis API"

@app.route('/get-next-question', methods=['GET'])
def get_next_question():
    # Example question; replace with dynamic question retrieval as needed
    return jsonify({"question": "How are you feeling today?"})

@app.route('/submit-daily-journal-answer', methods=['POST'])
def submit_journal_answer():
    data = request.get_json()
    answer = data.get("answer")
    uid = data.get("uid")

    # Perform sentiment analysis on the answer
    sentiment = analyze_sentiment(answer)

    # Return the sentiment with a success message
    return jsonify({
        "message": "Journal answer submitted successfully!",
        "sentiment": sentiment
    })

def analyze_sentiment(text):
    blob = TextBlob(text)
    return "positive" if blob.sentiment.polarity > 0 else "negative"

if __name__ == "__main__":
    app.run(debug=True)
