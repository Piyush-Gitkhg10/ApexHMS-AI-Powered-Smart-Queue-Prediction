const Patient = require("../models/Patient");

const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find({}).populate("user", "name email");
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addPatient = async (req, res) => {
    try {
        const {
            user,
            patientId,
            age,
            gender,
            bloodGroup,
            contactNumber,
            address,
            departmentAssign,
            emergencyContact,
        } = req.body;

        const patientExists = await Patient.findOne({ patientId });
        if (patientExists) {
            return res.status(400).json({ message: "Patient ID already exists" });
        }

        const patient = await Patient.create({
            user,
            patientId,
            age,
            gender,
            bloodGroup,
            contactNumber,
            address,
            departmentAssign,
            emergencyContact,
        });

        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPatients, addPatient };
