from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)  # Allows Node.js to communicate with Python


# MOCK NLP MODEL (Replace this block with your actual ML model later)
def analyze_symptoms(text):
    text = text.lower()
    if any(word in text for word in ["chest pain", "heart", "pressure", "arm ache"]):
        return [
            {"condition": "Myocardial Infarction", "confidence": 92},
            {"condition": "Angina", "confidence": 78},
        ]
    elif any(word in text for word in ["fever", "cough", "chills"]):
        return [
            {"condition": "Influenza", "confidence": 88},
            {"condition": "COVID-19", "confidence": 81},
        ]
    elif any(word in text for word in ["headache", "blur", "nausea"]):
        return [
            {"condition": "Migraine", "confidence": 85},
            {"condition": "Hypertension", "confidence": 60},
        ]
    else:
        return [{"condition": "General Viral Infection", "confidence": 55}]


@app.route("/predict-diagnosis", methods=["POST"])
def predict_diagnosis():
    data = request.get_json()

    if not data or "notes" not in data:
        return jsonify({"error": "No clinical notes provided"}), 400

    # Simulate ML processing delay
    time.sleep(1.5)

    # Run the "Model"
    predictions = analyze_symptoms(data["notes"])

    return jsonify(
        {
            "status": "success",
            "predictions": predictions,
            "analyzed_text_length": len(data["notes"]),
        }
    )


if __name__ == "__main__":
    # Run the AI microservice on port 5001 so it doesn't clash with Node.js
    app.run(port=5001, debug=True)
