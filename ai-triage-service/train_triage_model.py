import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, accuracy_score
import joblib


# 1. LOAD DATASET
file_name = "triage_dataset_csv.csv"
print(f"Loading {file_name}...")
df = pd.read_csv(file_name)


# 2. PREVENT DATA LEAKAGE & SELECT TARGET

print("Cleaning data and dropping future knowledge columns...")


# We map the 1-5 KTAS scale to the strings our React frontend expects
# KTAS 1-2: Emergency | KTAS 3: Urgent | KTAS 4-5: Standard
def map_ktas_to_label(score):
    if score in [1, 2]:
        return "Emergency"
    elif score == 3:
        return "Urgent"
    else:
        return "Standard"


# Apply mapping to create our Target column
df["TriageLevel"] = df["KTAS_expert"].apply(map_ktas_to_label)
y = df["TriageLevel"]

# Drop columns that represent future knowledge (post-triage events) or redundant data
columns_to_drop = [
    "KTAS_expert",
    "KTAS_RN",
    "Diagnosis in ED",
    "Disposition",
    "Error_group",
    "Length of stay_min",
    "KTAS duration_min",
    "mistriage",
    "Group",
    "TriageLevel",
]
X = df.drop(columns=columns_to_drop)


# 3. FIX MESSY VITALS

# These columns were imported as text because of typos/symbols. We force them to be numbers.
messy_numeric_cols = ["NRS_pain", "SBP", "DBP", "HR", "RR", "BT", "Saturation"]
for col in messy_numeric_cols:
    X[col] = pd.to_numeric(X[col], errors="coerce")


# 4. HANDLE MISSING VALUES & ENCODING

# A. Categorical (Text) Data Encoding
categorical_cols = X.select_dtypes(include=["object", "category"]).columns
label_encoders = {}

for col in categorical_cols:
    le = LabelEncoder()
    # Fill missing text with 'Unknown'
    X[col] = X[col].fillna("Unknown")
    X[col] = le.fit_transform(X[col].astype(str))
    label_encoders[col] = le

# B. Numeric Data Imputation (Fills missing vitals with the median)
numeric_cols = X.select_dtypes(include=["int64", "float64"]).columns
imputer = SimpleImputer(strategy="median")
X[numeric_cols] = imputer.fit_transform(X[numeric_cols])


# 5. TRAIN / TEST SPLIT

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)


# 6. TRAIN THE MODEL

print("\nTraining Random Forest Model (This will take a few seconds)...")
model = RandomForestClassifier(
    n_estimators=100, max_depth=15, random_state=42, class_weight="balanced"
)
model.fit(X_train, y_train)


# 7. EVALUATE THE MODEL

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n==========================================")
print(f"✅ MODEL TRAINING COMPLETE")
print(f"Accuracy: {accuracy * 100:.2f}%")
print(f"==========================================")
print("\nDetailed Classification Report:")
print(classification_report(y_test, y_pred))


# 8. EXPORT FOR FASTAPI

print("\nSaving model, encoders, and features for the FastAPI backend...")
joblib.dump(model, "triage_model.pkl")
joblib.dump(label_encoders, "triage_encoders.pkl")
joblib.dump(imputer, "triage_imputer.pkl")

# Save feature names so FastAPI knows EXACTLY what order to send the data in
joblib.dump(list(X.columns), "model_features.pkl")

print("Success! .pkl files generated and ready for your microservice.")
