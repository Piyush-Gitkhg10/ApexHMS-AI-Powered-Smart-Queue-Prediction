const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema(
    {
        testId: { type: String, required: true, unique: true },
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
        testType: { type: String, required: true },
        date: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Completed"],
            default: "Pending",
        },
        resultData: { type: String },
    },
    { timestamps: true },
);

const LabTest = mongoose.model("LabTest", labTestSchema);
module.exports = LabTest;
