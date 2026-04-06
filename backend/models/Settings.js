const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    totalBeds: { type: Number, default: 500 },
    hospitalName: { type: String, default: "Apex Healthcare Center" },
    registrationNumber: { type: String, default: "REG-2023-9981" },
    emergencyHelpline: { type: String, default: "1-800-APEX-911" },
    address: { type: String, default: "123 Health Avenue, Medical District, NY 10001" },
});

module.exports = mongoose.model("Settings", settingsSchema);
