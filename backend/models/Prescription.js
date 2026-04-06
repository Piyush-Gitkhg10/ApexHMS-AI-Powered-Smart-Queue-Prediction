const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
    {
        prescriptionId: { type: String, required: true, unique: true }, // e.g., RX-101
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
        medication: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g., "10mg"
        frequency: { type: String, required: true }, // e.g., "Twice a day"
        duration: { type: String, required: true }, // e.g., "7 Days"
        status: {
            type: String,
            enum: ["Active", "Completed", "Cancelled"],
            default: "Active",
        },
        notes: { type: String },
    },
    { timestamps: true },
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);
module.exports = Prescription;
