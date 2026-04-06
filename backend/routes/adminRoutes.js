const express = require("express");
const router = express.Router();

const {
    getAdminStats,
    createUser,
    getUsersByRole,
    deleteUser,
    updateBedCapacity,
    getAllAppointments,
    createAppointment,
    updateAppointmentStatus,
    getAllLabTests,
    updateLabTestStatus,
    getHospitalSettings,
    updateHospitalSettings,
    updateAdminProfile,
    getReports,
    createReport,
    updateReportStatus,
    getLatestAppointmentForPatient,
    getDoctorQueue,
    updatePatientDetails,
    completeConsultation,
    getPatientLabs,
    requestLab,
    getDoctorHistory,
    analyzeSymptoms,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/stats", protect, authorize("Admin"), getAdminStats);
router.post("/create-user", protect, authorize("Admin"), createUser);
router.get("/users/:role", protect, authorize("Admin"), getUsersByRole);
router.delete("/users/:id", protect, authorize("Admin"), deleteUser);
router.put("/settings/beds", protect, authorize("Admin"), updateBedCapacity);
router.get("/appointments", protect, authorize("Admin"), getAllAppointments);
router.put("/appointments/:id/status", protect, authorize("Admin"), updateAppointmentStatus);
router.get("/lab-tests", protect, authorize("Admin"), getAllLabTests);
router.put("/lab-tests/:id/status", protect, authorize("Admin"), updateLabTestStatus);
router.get("/settings/hospital", protect, authorize("Admin"), getHospitalSettings);
router.put("/settings/hospital", protect, authorize("Admin"), updateHospitalSettings);
router.put("/profile", protect, authorize("Admin"), updateAdminProfile);
router.get("/reports", protect, authorize("Admin"), getReports);
router.post("/reports", protect, authorize("Admin"), createReport);
router.put("/reports/:id/status", protect, authorize("Admin"), updateReportStatus);
router.post("/appointments", protect, authorize("Admin"), createAppointment);
router.get(
    "/appointments/latest/:patientId",
    protect,
    authorize("Admin"),
    getLatestAppointmentForPatient,
);
router.get("/doctor/queue", protect, getDoctorQueue);
router.put("/doctor/patient/:patientId/vitals", protect, updatePatientDetails);

router.put("/doctor/appointment/:appointmentId/complete", protect, completeConsultation);
// Allow doctors to create follow-up appointments too:
router.post("/doctor/appointments", protect, createAppointment);
router.get("/doctor/patient/:patientId/labs", protect, getPatientLabs);
router.post("/doctor/patient/:patientId/labs", protect, requestLab);
router.get("/doctor/history", protect, getDoctorHistory);
router.post("/doctor/patient/analyze", protect, analyzeSymptoms);
router.put("/doctor/appointment/:appointmentId/status", protect, updateAppointmentStatus);

module.exports = router;
