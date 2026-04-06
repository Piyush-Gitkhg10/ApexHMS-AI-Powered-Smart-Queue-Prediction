const express = require("express");
const router = express.Router();
const { getLabTests, createLabTest } = require("../controllers/labTestController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
    .route("/")
    .get(protect, getLabTests)
    .post(protect, authorize("Admin", "Doctor"), createLabTest);

module.exports = router;
