const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        roomOrArea: { type: String, required: true },
        status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
        reportedBy: { type: String, default: "System Admin" },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
