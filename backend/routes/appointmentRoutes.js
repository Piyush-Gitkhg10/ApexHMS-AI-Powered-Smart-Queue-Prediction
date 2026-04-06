const express = require("express");
const router = express.Router();
const { getAppointments, createAppointment } = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
    .route("/")
    .get(protect, getAppointments)
    .post(protect, authorize("Admin", "Patient", "Doctor"), createAppointment);

module.exports = router;
