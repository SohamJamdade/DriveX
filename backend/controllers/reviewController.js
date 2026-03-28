/**
 * REVIEW CONTROLLER
 * Users can review vehicles they've booked and completed
 */

const Review = require("../models/Review");
const Booking = require("../models/Booking");

// ─── GET /api/reviews/vehicle/:vehicleId ───────
exports.getVehicleReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId })
      .populate("user", "name avatar")
      .sort("-createdAt");

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/reviews/vehicle/:vehicleId ──────
exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment, bookingId } = req.body;

    // Optional: verify the user actually booked and completed a trip in this vehicle
    if (bookingId) {
      const booking = await Booking.findOne({
        _id: bookingId,
        user: req.user.id,
        vehicle: req.params.vehicleId,
        status: "completed",
      });

      if (!booking) {
        return res.status(403).json({
          success: false,
          message: "You can only review vehicles from completed bookings.",
        });
      }
    }

    // Create review (unique index in model prevents duplicate reviews)
    const review = await Review.create({
      user: req.user.id,
      vehicle: req.params.vehicleId,
      booking: bookingId,
      rating,
      comment,
    });

    await review.populate("user", "name avatar");

    res.status(201).json({ success: true, review });
  } catch (error) {
    // Handle duplicate review (unique index violation)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this vehicle.",
      });
    }
    next(error);
  }
};

// ─── DELETE /api/reviews/:id ───────────────────
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    // Only reviewer or admin can delete
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await Review.findByIdAndDelete(req.params.id);
    // Post-delete hook in model will recalculate vehicle rating

    res.json({ success: true, message: "Review deleted." });
  } catch (error) {
    next(error);
  }
};
