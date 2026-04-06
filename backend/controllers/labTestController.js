const LabTest = require("../models/LabTest");

const getLabTests = async (req, res) => {
    try {
        const labTests = await LabTest.find({})
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } });
        res.json(labTests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createLabTest = async (req, res) => {
    try {
        const { testId, patient, doctor, testType, date } = req.body;

        const testExists = await LabTest.findOne({ testId });
        if (testExists) {
            return res.status(400).json({ message: "Lab Test ID already exists" });
        }

        const labTest = await LabTest.create({
            testId,
            patient,
            doctor,
            testType,
            date,
        });

        res.status(201).json(labTest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLabTests, createLabTest };
