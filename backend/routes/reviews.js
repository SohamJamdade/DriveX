/**
 * REVIEW ROUTES
 */
const express = require("express");
const router = express.Router();
const { getVehicleReviews, createReview, deleteReview } = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");

router.get("/vehicle/:vehicleId", getVehicleReviews);
router.post("/vehicle/:vehicleId", protect, createReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
