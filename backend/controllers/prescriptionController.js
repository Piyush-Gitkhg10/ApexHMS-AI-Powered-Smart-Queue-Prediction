const Prescription = require("../models/Prescription");

// @desc    Get all prescriptions (can be filtered by patient or doctor via query params later)
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({})
            .populate({ path: "patient", populate: { path: "user", select: "name email" } })
            .populate({
                path: "doctor",
                populate: { path: "user", select: "name specialization" },
            });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctors only)
const createPrescription = async (req, res) => {
    try {
        const {
            prescriptionId,
            patient,
            doctor,
            medication,
            dosage,
            frequency,
            duration,
            notes,
        } = req.body;

        const exists = await Prescription.findOne({ prescriptionId });
        if (exists) {
            return res.status(400).json({ message: "Prescription ID already exists" });
        }

        const prescription = await Prescription.create({
            prescriptionId,
            patient,
            doctor,
            medication,
            dosage,
            frequency,
            duration,
            notes,
        });

        res.status(201).json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPrescriptions, createPrescription };
