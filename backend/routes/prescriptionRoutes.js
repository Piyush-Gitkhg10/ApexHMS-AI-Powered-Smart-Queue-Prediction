const express = require("express");
const router = express.Router();
const {
    getPrescriptions,
    createPrescription,
} = require("../controllers/prescriptionController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
    .route("/")
    .get(protect, getPrescriptions) // Patients, Doctors, and Admins can view
    .post(protect, authorize("Doctor", "Admin"), createPrescription); // Only Doctors/Admins can create

module.exports = router;
