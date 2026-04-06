const express = require("express");
const router = express.Router();
const { analyzeDiagnostics } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/diagnose", protect, authorize("Doctor"), analyzeDiagnostics);

module.exports = router;
