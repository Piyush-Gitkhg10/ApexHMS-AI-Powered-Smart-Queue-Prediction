const express = require("express");
const router = express.Router();
const { getDoctors, addDoctor } = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/").get(protect, getDoctors).post(protect, authorize("Admin"), addDoctor);

module.exports = router;
