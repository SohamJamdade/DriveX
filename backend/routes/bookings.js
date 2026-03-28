/**
 * BOOKING ROUTES
 */
const express = require("express");
const router = express.Router();
const {
  createBooking, getMyBookings, getBooking,
  cancelBooking, getAllBookings, checkAvailability,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

// All booking routes require authentication
router.use(protect);

router.post("/", createBooking);
router.get("/my", getMyBookings);
router.get("/vehicle/:vehicleId/availability", checkAvailability);
router.get("/:id", getBooking);
router.put("/:id/cancel", cancelBooking);

// Admin: view all bookings
router.get("/", authorize("admin"), getAllBookings);

module.exports = router;
