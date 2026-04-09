const mongoose = require("mongoose");

const labResultSchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        testName: { type: String, required: true }, // e.g., "Complete Blood Count (CBC)"
        category: { type: String, default: "Blood Test" }, // e.g., Blood Test, Imaging, Urine
        status: {
            type: String,
            enum: ["Pending", "Completed"],
            default: "Pending",
        },
        // These fields populate once the lab tech finishes the test:
        resultValue: { type: String, default: "" },
        unit: { type: String, default: "" }, // e.g., "mg/dL"
        referenceRange: { type: String, default: "" }, // e.g., "70-99"
        isAbnormal: { type: Boolean, default: false },
        notes: { type: String, default: "" },
        dateOrdered: { type: Date, default: Date.now },
        dateCompleted: { type: Date },
    },
    { timestamps: true },
);

const LabResult = mongoose.model("LabResult", labResultSchema);
module.exports = LabResult;
