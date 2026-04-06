const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctorId: { type: String, required: true, unique: true }, // e.g., DOC-001
        department: { type: String, required: true },
        specialization: { type: String, required: true },
        contactNumber: { type: String, required: true },
        status: { type: String, enum: ["Active", "On Leave"], default: "Active" },
        availability: [
            {
                day: String,
                startTime: String,
                endTime: String,
            },
        ],
    },
    { timestamps: true },
);

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
