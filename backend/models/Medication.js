const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        status: {
            type: String,
            enum: ["Active", "Completed"],
            default: "Active",
        },
        datePrescribed: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

const Medication = mongoose.model("Medication", medicationSchema);
module.exports = Medication;
