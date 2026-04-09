const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Medication = require("../models/Medication");
const LabResult = require("../models/LabResult");

// @desc    Get all patients (Used by Admin)
const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find({}).populate("user", "name email");
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new patient (Used by Admin)
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

// @desc    Get logged-in patient's profile and health metrics (Used by Patient Portal)
const getPatientProfile = async (req, res) => {
    try {
        // Find the patient profile linked to the logged-in user account
        const patientProfile = await Patient.findOne({ user: req.user._id }).populate(
            "user",
            "name email gender",
        );

        if (!patientProfile) {
            return res.status(404).json({ message: "Patient profile not found." });
        }

        res.json({
            name: patientProfile.user.name,
            patientId: patientProfile.patientId,
            gender: patientProfile.user.gender,
            age: patientProfile.age,
            bloodGroup: patientProfile.bloodGroup,
            weight: patientProfile.weight,
            bloodPressure: patientProfile.bloodPressure,
            allergies: patientProfile.allergies,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient's active appointments and live queue positions
const getPatientQueueStatus = async (req, res) => {
    try {
        const patientProfile = await Patient.findOne({ user: req.user._id });

        // 1. Find ALL pending appointments for this patient, sorted chronologically
        const upcomingAppointments = await Appointment.find({
            patient: patientProfile._id,
            status: "Pending",
        })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ date: 1, time: 1 }); // Sort by earliest date and time first

        if (!upcomingAppointments || upcomingAppointments.length === 0) {
            return res.json({ hasAppointment: false, appointments: [] });
        }

        // 2. Calculate the queue position for EACH appointment simultaneously
        const queueStatuses = await Promise.all(
            upcomingAppointments.map(async (app) => {
                const peopleAheadOfMe = await Appointment.countDocuments({
                    doctor: app.doctor._id,
                    status: "Pending",
                    date: app.date,
                    // The AI Magic: Count people with a higher score, or same score booked earlier
                    $or: [
                        { triageScore: { $gt: app.triageScore } },
                        { triageScore: app.triageScore, createdAt: { $lt: app.createdAt } },
                    ],
                });

                return {
                    _id: app._id,
                    appointment: app,
                    doctorName: app.doctor.user.name,
                    queuePosition: peopleAheadOfMe + 1,
                    estimatedWaitMinutes: (peopleAheadOfMe + 1) * 15,
                };
            }),
        );

        // Return the array of all calculated queues
        res.json({
            hasAppointment: true,
            appointments: queueStatuses,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all medications for the logged-in patient
const getPatientMedications = async (req, res) => {
    try {
        const patientProfile = await Patient.findOne({ user: req.user._id });
        const medications = await Medication.find({ patient: patientProfile._id })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 });
        res.json(medications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update or delete a medication
const updateMedicationStatus = async (req, res) => {
    try {
        const { action } = req.body; // 'complete' or 'remove'

        if (action === "remove") {
            await Medication.findByIdAndDelete(req.params.id);
            return res.json({ message: "Medication removed" });
        }

        if (action === "complete") {
            const med = await Medication.findByIdAndUpdate(
                req.params.id,
                { status: "Completed" },
                { new: true },
            );
            return res.json({ message: "Marked as completed", med });
        }

        res.status(400).json({ message: "Invalid action" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all lab results for the logged-in patient
const getPatientLabs = async (req, res) => {
    try {
        const patientProfile = await Patient.findOne({ user: req.user._id });

        const labs = await LabResult.find({ patient: patientProfile._id })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ dateOrdered: -1 }); // Newest first
        res.json(labs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient's medical history (Completed & Cancelled appointments)
const getPatientHistory = async (req, res) => {
    try {
        const patientProfile = await Patient.findOne({ user: req.user._id });

        // Find appointments that are no longer pending
        const history = await Appointment.find({
            patient: patientProfile._id,
            status: { $in: ["Completed", "Cancelled"] },
        })
            .populate({
                path: "doctor",
                populate: { path: "user", select: "name" },
            })
            .sort({ date: -1, time: -1 }); // Sort by newest date first

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export ALL THREE functions
module.exports = {
    getPatients,
    addPatient,
    getPatientProfile,
    getPatientQueueStatus,
    getPatientMedications,
    updateMedicationStatus,
    getPatientLabs,
    getPatientHistory,
};
