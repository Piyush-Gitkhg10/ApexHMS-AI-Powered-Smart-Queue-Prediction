const express = require("express");
const router = express.Router();
const { getPatients, addPatient } = require("../controllers/patientController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
    .route("/")
    .get(protect, authorize("Admin", "Doctor"), getPatients)
    .post(protect, authorize("Admin"), addPatient);

module.exports = router;
