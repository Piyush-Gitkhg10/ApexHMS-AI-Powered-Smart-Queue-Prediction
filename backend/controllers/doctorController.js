const Doctor = require("../models/Doctor");

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({}).populate("user", "name email");
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addDoctor = async (req, res) => {
    try {
        const { user, doctorId, department, specialization, contactNumber, availability } =
            req.body;

        const doctorExists = await Doctor.findOne({ doctorId });
        if (doctorExists) {
            return res.status(400).json({ message: "Doctor ID already exists" });
        }

        const doctor = await Doctor.create({
            user,
            doctorId,
            department,
            specialization,
            contactNumber,
            availability,
        });

        res.status(201).json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDoctors, addDoctor };
