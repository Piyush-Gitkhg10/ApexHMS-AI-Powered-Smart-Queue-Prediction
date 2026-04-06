const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        patientId: { type: String, required: true, unique: true }, // e.g., PAT-1029
        age: { type: Number, required: true },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
        bloodGroup: { type: String, required: true },
        weight: { type: String },
        bloodPressure: { type: String },
        contactNumber: { type: String, required: true },
        address: { type: String },
        allergies: [{ type: String }],
        departmentAssign: { type: String },
        status: {
            type: String,
            enum: ["Admitted", "In Treatment", "Discharged"],
            default: "In Treatment",
        },
        emergencyContact: {
            name: String,
            relation: String,
            phone: String,
        },
    },
    { timestamps: true },
);

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
