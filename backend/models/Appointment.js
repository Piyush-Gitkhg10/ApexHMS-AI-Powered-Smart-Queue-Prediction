const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        appointmentId: { type: String, required: true, unique: true }, // e.g., APT-101
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        type: { type: String, required: true }, // e.g., Consultation, Follow-up
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"],
            default: "Pending",
        },
        prescription: { type: String, default: "" },
        clinicalNotes: { type: String, default: "" },
    },
    { timestamps: true },
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
