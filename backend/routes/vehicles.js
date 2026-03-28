/**
 * VEHICLE ROUTES
 */
const express = require("express");
const router = express.Router();
const {
  getVehicles, getVehicle, createVehicle, updateVehicle,
  deleteVehicle, toggleWishlist, getRecommended, getCities,
} = require("../controllers/vehicleController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getVehicles);
router.get("/recommended", getRecommended);
router.get("/cities", getCities);
router.get("/:id", getVehicle);

// Protected routes (logged-in users)
router.post("/:id/wishlist", protect, toggleWishlist);

// Admin-only routes
router.post("/", protect, authorize("admin"), createVehicle);
router.put("/:id", protect, authorize("admin"), updateVehicle);
router.delete("/:id", protect, authorize("admin"), deleteVehicle);

module.exports = router;
