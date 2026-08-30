🏥 ApexHMS
AI-Enhanced Hospital Management System
ApexHMS is a full-stack Hospital Management System designed to streamline core healthcare workflows while integrating AI-powered clinical assistance and patient triage. The platform combines a modern React frontend, Node.js/Express backend, MongoDB data layer, real-time communication through Socket.IO, and dedicated Python AI services. ApexHMS is a software project intended for demonstration and educational purposes. AI-generated predictions and triage recommendations should not be used as a substitute for professional medical judgment.

✨ Overview
ApexHMS brings hospital operations and AI-assisted healthcare workflows together in a single application.
The system is organized into independent application layers:

                    ┌─────────────────────┐
                    │     React Client    │
                    │   Vite + Tailwind   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Node.js Backend   │
                    │ Express + MongoDB   │
                    └──────┬────────┬─────┘
                           │        │
                ┌──────────┘        └──────────┐
                ▼                              ▼
      ┌──────────────────┐           ┌──────────────────┐
      │   AI Engine      │           │  AI Triage       │
      │ Python / Flask   │           │ FastAPI + ML     │
      └──────────────────┘           └──────────────────┘

The architecture keeps the main application backend independent from the Python-based AI services, making the system easier to extend and maintain.

🚀 Key Features
👨‍⚕️ Patient Management
Patient registration and profile management
Patient information and medical records
Patient-specific healthcare workflows
Secure access to patient-related information

🩺 Doctor Management
Doctor profiles and management
Doctor-specific workflows
Appointment management
Real-time doctor communication through Socket.IO rooms

📅 Appointment Management
Create and manage appointments
Appointment-related patient and doctor workflows
Real-time communication support

🧪 Laboratory Management
Manage laboratory tests
Store and retrieve lab-test information
Integrate test information into patient workflows

💊 Prescription Management
Prescription creation and management
Associate prescriptions with patients and healthcare workflows

🔐 Authentication & Authorization
User authentication
Password hashing using bcrypt
JWT-based authentication
Role-aware backend architecture
Administrative management functionality

🤖 AI-Assisted Clinical Features
ApexHMS includes dedicated AI services for healthcare-related assistance.
AI Diagnosis Assistance
The AI engine provides a separate Python service for analyzing clinical notes and returning possible conditions with confidence scores.

The current implementation exposes:
POST /predict-diagnosis

Example request:

{
  "notes": "Patient reports fever, cough and chills"
}

Example response:

{
  "status": "success",
  "predictions": [
    {
      "condition": "Influenza",
      "confidence": 88
    },
    {
      "condition": "COVID-19",
      "confidence": 81
    }
  ]
}

The current ai-engine implementation is a lightweight prototype/mock NLP service and is structured so that it can later be replaced with a production ML/NLP model.

🏥 AI Patient Triage
A separate machine-learning service provides triage predictions using patient information and vital signs.
The service accepts:

Age
Gender
Heart rate
Systolic blood pressure
Diastolic blood pressure
Temperature
Pain level
Symptoms

The /predict-triage endpoint processes the input through the trained model and preprocessing artifacts before returning a predicted triage level and confidence score.

Example response:

{
  "triageLevel": "Urgent",
  "triageScore": 87.4
}

The triage service uses persisted model artifacts including:

triage_model.pkl
triage_encoders.pkl
triage_imputer.pkl
model_features.pkl

🧠 AI / Machine Learning Architecture
The AI components are intentionally separated from the main Node.js application.

Patient Data
     │
     ▼
Node.js Backend
     │
     ├──────────────► AI Diagnosis Service
     │                    │
     │                    ▼
     │              Clinical Predictions
     │
     └──────────────► AI Triage Service
                          │
                          ▼
                    ML Preprocessing
                          │
                          ▼
                    Trained ML Model
                          │
                          ▼
                  Triage Level + Score

The triage service uses the same preprocessing artifacts generated during model training to transform incoming data before inference.

📁 Project Structure
ApexHMS/
│
├── ai-engine/
│   ├── app.py
│   └── requirements.txt
│
├── ai-triage-service/
│   ├── main.py
│   ├── train_triage_model.py
│   ├── triage_dataset_csv.csv
│   ├── triage_model.pkl
│   ├── triage_encoders.pkl
│   ├── triage_imputer.pkl
│   └── model_features.pkl
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── .gitignore
└── package.json

🔌 Backend API Architecture
The backend follows a modular route/controller architecture.

Main API areas include:
/api/auth
/api/patients
/api/doctors
/api/appointments
/api/lab-tests
/api/prescriptions
/api/admin
/api/ai

The backend also establishes Socket.IO connections for doctor- and patient-specific communication rooms.

Doctor
   │
   └── join_doctor_room
              │
              ▼
        Socket.IO Room

Patient
   │
   └── join_patient_room
              │
              ▼
        Socket.IO Room

The backend server runs on port 5000 by default.

⚙️ Getting Started
Prerequisites - Make sure you have the following installed:

Node.js
npm
Python 3.x
MongoDB
Git

1. Clone the Repository:
- git clone https://github.com/Piyush-Gitkhg10/ApexHMS.git
- cd ApexHMS

2. Configure the Backend
a. Navigate to the backend:
- cd backend

b. Install dependencies:
- npm install

c. Create a .env file:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

d. Start the backend in development mode:
- npm run dev

Or, start normally:
- npm start

The API should be available at:
- http://localhost:5000

3. Start the Frontend
a. Open another terminal:
- cd frontend

b. Install dependencies:
- npm install

c. Start the development server:
- npm run dev

The Vite development server will normally be available at:
- http://localhost:5173

4. Start the AI Diagnosis Service
a. Open another terminal:
- cd ai-engine

b. Install Python dependencies:
- pip install -r requirements.txt

c. Start the Flask service:
- python app.py

The AI diagnosis service runs on:
- http://localhost:5001

5. Start the AI Triage Service
a. Open another terminal:
- cd ai-triage-service

b. Install the required Python dependencies.

c. Then start FastAPI with:
- uvicorn main:app --reload --port 8000

The triage API will be available at:
- http://localhost:8000

🔄 Running the Complete System

For local development, run the following services:

Service	Port	Technology
Frontend	5173	React + Vite
Backend	5000	Node.js + Express
AI Diagnosis	5001	Flask
AI Triage	8000	FastAPI
Database	27017	MongoDB
Browser
   │
   ▼
React / Vite
   │
   ▼
Express API ──────────────► MongoDB
   │
   ├────────► Flask AI Engine
   │
   └────────► FastAPI Triage Service
   
🔐 Security Considerations
ApexHMS includes several foundational security mechanisms:
JWT-based authentication
Password hashing with bcrypt
Environment-variable based configuration
Modular authorization middleware
Separation of AI services from the core backend

For production deployment, additional controls should be implemented, including:
HTTPS/TLS
Strong secret management
Rate limiting
Input validation and sanitization
Security headers
Audit logging
Fine-grained role-based access control
Healthcare data privacy and compliance controls

🗺️ Roadmap
- Potential future improvements include:
- Production-grade NLP/LLM diagnosis assistance
- Improved triage model validation and monitoring
- Explainable AI predictions
- Doctor-patient real-time chat
- Notifications and reminders
- Advanced hospital analytics
- Role-based dashboards
- Medical report generation
- Cloud deployment
- Docker-based development environment
- Automated testing
- CI/CD pipeline
- Improved audit logging
- Production-grade healthcare data security

⚠️ Disclaimer
ApexHMS is a software engineering and AI/ML project created for educational, demonstration, and portfolio purposes. The AI diagnosis and triage functionality is not a medical device and must not be relied upon for actual medical diagnosis, treatment, or emergency decisions. Always consult a qualified healthcare professional for medical advice.

👨‍💻 Author
Piyush Kumar
GitHub: @Piyush-Gitkhg10
