const Appointment = require("../models/Appointment");

const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAppointment = async (req, res) => {
    try {
        const { appointmentId, patient, doctor, date, time, type } = req.body;

        const appointmentExists = await Appointment.findOne({ appointmentId });
        if (appointmentExists) {
            return res.status(400).json({ message: "Appointment ID already exists" });
        }

        const appointment = await Appointment.create({
            appointmentId,
            patient,
            doctor,
            date,
            time,
            type,
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAppointments, createAppointment };
