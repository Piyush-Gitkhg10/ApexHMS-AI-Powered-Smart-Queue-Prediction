from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()

# 1. Load the exported AI files
print("Loading AI Model and Preprocessors...")
try:
    model = joblib.load("triage_model.pkl")
    encoders = joblib.load("triage_encoders.pkl")
    imputer = joblib.load("triage_imputer.pkl")
    feature_columns = joblib.load("model_features.pkl")
    print("✅ AI Engine Ready!")
except Exception as e:
    print(f"❌ Error loading AI files: {e}")


# 2. Define what data we expect from the Node.js Backend
class PatientVitals(BaseModel):
    age: int
    gender: str  # "Male" or "Female"
    heart_rate: float
    bp_systolic: float
    bp_diastolic: float
    temperature: float
    pain_level: int
    symptoms: str


@app.post("/predict-triage")
def predict_triage(data: PatientVitals):
    try:
        # A. Create a dictionary with the exact columns the Kaggle model expects.
        # For data your app doesn't collect (like 'Arrival mode'), we provide safe default/baseline values.
        input_data = {
            "Sex": (
                1 if data.gender.lower() == "male" else 2
            ),  # Assuming 1=Male, 2=Female based on common datasets
            "Age": data.age,
            "Patients number per hour": 5,  # Baseline default
            "Arrival mode": 3,  # Baseline default (e.g., walk-in)
            "Injury": 2,  # Baseline default (no injury)
            "Chief_complain": data.symptoms if data.symptoms else "Unknown",
            "Mental": 1,  # Baseline default (Alert)
            "Pain": 1 if data.pain_level > 0 else 0,
            "NRS_pain": data.pain_level,
            "SBP": data.bp_systolic,
            "DBP": data.bp_diastolic,
            "HR": data.heart_rate,
            "RR": 18,  # Baseline default Respiratory Rate
            "BT": data.temperature,
            "Saturation": 98,  # Baseline default O2 Saturation
        }

        # Create a single-row DataFrame
        df = pd.DataFrame([input_data])

        # Ensure we only have the columns the model expects, in the exact right order
        for col in feature_columns:
            if col not in df.columns:
                df[col] = 0  # Safety fallback
        df = df[feature_columns]

        # B. Encode the text data using the exact same encoders from training
        for col, le in encoders.items():
            if col in df.columns:
                # If the symptom is brand new, we map it to 'Unknown' so the model doesn't crash
                df[col] = df[col].apply(lambda x: x if x in le.classes_ else "Unknown")

                # We need to temporarily add 'Unknown' to the classes if it isn't there,
                # though our training script handled this.
                try:
                    df[col] = le.transform(df[col].astype(str))
                except ValueError:
                    df[col] = 0  # Fallback if encoding completely fails

        # C. Impute any missing numeric values
        df[df.columns] = imputer.transform(df)

        # D. Make the Prediction!
        prediction = model.predict(df)[0]

        # Get confidence score (probability of the predicted class)
        probabilities = model.predict_proba(df)[0]
        confidence_score = round(max(probabilities) * 100, 1)

        return {
            "triageLevel": prediction,  # e.g., "Emergency", "Urgent", "Standard"
            "triageScore": confidence_score,
        }

    except Exception as e:
        print(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Run this server using: uvicorn main:app --reload --port 8000
