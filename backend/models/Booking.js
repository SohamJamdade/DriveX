/**
 * BOOKING MODEL
 * Core of the platform — stores rental reservations
 * Prevents double booking via date overlap checks
 */

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    // Rental start and end dates
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    // Number of days = (endDate - startDate) in days
    totalDays: {
      type: Number,
      required: true,
    },

    // Price snapshot at time of booking (in case price changes later)
    pricePerDay: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "confirmed",
    },

    // Pickup location (city)
    pickupCity: {
      type: String,
      required: true,
    },

    // Optional: special requests from user
    notes: {
      type: String,
      maxlength: 500,
    },

    // When the booking was cancelled (if applicable)
    cancelledAt: {
      type: Date,
    },

    // Reason for cancellation
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Virtual: Duration in days ────────────────
bookingSchema.virtual("duration").get(function () {
  return Math.ceil(
    (this.endDate - this.startDate) / (1000 * 60 * 60 * 24)
  );
});

// ─── Static Method: Check for Date Conflicts ──
// This is the KEY method that prevents double booking
bookingSchema.statics.checkAvailability = async function (
  vehicleId,
  startDate,
  endDate,
  excludeBookingId = null
) {
  const query = {
    vehicle: vehicleId,
    status: { $nin: ["cancelled"] }, // Ignore cancelled bookings
    // Check for any overlap: existing booking overlaps with requested dates
    // Overlap condition: existing.start < requested.end AND existing.end > requested.start
    $or: [
      {
        startDate: { $lt: new Date(endDate) },
        endDate: { $gt: new Date(startDate) },
      },
    ],
  };

  // When editing a booking, exclude the booking itself from the check
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await this.findOne(query);
  return !conflictingBooking; // Returns true if available (no conflicts)
};

// ─── Auto-update booking status ──────────────
// Mark bookings as 'active' or 'completed' based on current date
bookingSchema.statics.updateStatuses = async function () {
  const now = new Date();

  // Confirmed bookings whose start date has passed → active
  await this.updateMany(
    { status: "confirmed", startDate: { $lte: now } },
    { status: "active" }
  );

  // Active bookings whose end date has passed → completed
  await this.updateMany(
    { status: "active", endDate: { $lte: now } },
    { status: "completed" }
  );
};

module.exports = mongoose.model("Booking", bookingSchema);
