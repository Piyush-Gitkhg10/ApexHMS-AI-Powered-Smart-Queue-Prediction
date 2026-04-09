const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
    getPatients,
    addPatient,
    getPatientProfile,
    getPatientQueueStatus,
    getPatientMedications,
    updateMedicationStatus,
    getPatientLabs,
    getPatientHistory,
} = require("../controllers/patientController");

const {
    getSpecializations,
    getDoctorsBySpecialization,
} = require("../controllers/doctorController");

const { createAppointment } = require("../controllers/adminController");

router
    .route("/")
    .get(protect, authorize("Admin", "Doctor"), getPatients)
    .post(protect, authorize("Admin"), addPatient);

router.get("/profile", protect, getPatientProfile);
router.get("/specializations", protect, getSpecializations);
router.get("/doctors/:specialization", protect, getDoctorsBySpecialization);

// Booking the appointment
router.post("/book-appointment", protect, async (req, res) => {
    try {
        // We reuse the logic but ensure the patient ID comes from the logged-in user
        const Patient = require("../models/Patient");
        const patientProfile = await Patient.findOne({ user: req.user._id });

        // Call your existing createAppointment logic or implement a streamlined version here
        req.body.patientId = patientProfile.patientId;
        return createAppointment(req, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/queue-status", protect, getPatientQueueStatus);

router.get("/medications", protect, getPatientMedications);
router.put("/medications/:id", protect, updateMedicationStatus);

router.get("/labs", protect, getPatientLabs);

router.get("/history", protect, getPatientHistory);

module.exports = router;
