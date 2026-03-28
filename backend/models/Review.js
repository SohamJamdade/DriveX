/**
 * REVIEW MODEL
 * Users can leave ratings and reviews after completing a booking
 * One review per user per vehicle (enforced via unique index)
 */

const mongoose = require("mongoose");
const Vehicle = require("./Vehicle");

const reviewSchema = new mongoose.Schema(
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

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [500, "Comment too long"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── One review per user per vehicle ──────────
reviewSchema.index({ user: 1, vehicle: 1 }, { unique: true });

// ─── Auto-update Vehicle Rating ───────────────
// After saving a review, recalculate the vehicle's average rating
reviewSchema.statics.calcAverageRating = async function (vehicleId) {
  const stats = await this.aggregate([
    { $match: { vehicle: vehicleId } },
    {
      $group: {
        _id: "$vehicle",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Vehicle.findByIdAndUpdate(vehicleId, {
      rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
      reviewCount: stats[0].count,
    });
  } else {
    // No reviews left → reset
    await Vehicle.findByIdAndUpdate(vehicleId, { rating: 0, reviewCount: 0 });
  }
};

// Call calcAverageRating after each save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.vehicle);
});

// Call calcAverageRating after each delete
reviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) doc.constructor.calcAverageRating(doc.vehicle);
});

module.exports = mongoose.model("Review", reviewSchema);
