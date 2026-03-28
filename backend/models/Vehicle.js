/**
 * VEHICLE MODEL
 * Stores vehicle listings with all details needed for filtering/search
 */

const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vehicle name is required"],
      trim: true,
    },

    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["car", "bike", "suv", "van", "truck", "scooter"],
    },

    fuelType: {
      type: String,
      required: true,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng"],
    },

    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      default: "manual",
    },

    // Price per day in INR
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [0, "Price cannot be negative"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description too long"],
    },

    // Array of image URLs (use Unsplash/placeholder links)
    images: [
      {
        type: String,
      },
    ],

    // Vehicle features list
    features: [String],

    seats: {
      type: Number,
      default: 5,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    // Is this vehicle available for booking right now?
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Aggregate rating (updated when reviews are added)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    // How many times this vehicle has been booked (for recommendations)
    bookingCount: {
      type: Number,
      default: 0,
    },

    mileage: {
      type: String, // e.g. "15 km/l"
    },

    year: {
      type: Number,
    },

    licensePlate: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    // Add a virtual 'id' field
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for fast search/filter queries ───
vehicleSchema.index({ city: 1, type: 1, fuelType: 1 });
vehicleSchema.index({ pricePerDay: 1 });
vehicleSchema.index({ name: "text", brand: "text", description: "text" }); // Text search

// ─── Virtual: reviews populated separately ────
vehicleSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "vehicle",
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
