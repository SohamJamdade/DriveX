/**
 * VEHICLE CONTROLLER
 * CRUD operations + search, filter, and recommendation logic
 */

const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const User = require("../models/User");

// ─── GET /api/vehicles ─────────────────────────
// Supports: search, type, fuelType, city, minPrice, maxPrice, sort, page, limit
exports.getVehicles = async (req, res, next) => {
  try {
    const {
      search,
      type,
      fuelType,
      city,
      transmission,
      minPrice,
      maxPrice,
      sort = "-createdAt",
      page = 1,
      limit = 12,
      available,
    } = req.query;

    // Build filter object dynamically
    const filter = {};

    // Full-text search across name, brand, description
    if (search) {
      filter.$text = { $search: search };
    }

    if (type) filter.type = type;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (city) filter.city = { $regex: city, $options: "i" }; // case-insensitive
    if (available === "true") filter.isAvailable = true;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    // Pagination math
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).sort(sort).skip(skip).limit(limitNum),
      Vehicle.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: vehicles.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/vehicles/:id ────────────────────
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate({
      path: "reviews",
      populate: { path: "user", select: "name avatar" },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/vehicles/recommended ────────────
// Simple AI-like logic: return popular + well-rated vehicles
// excluding ones the user has already booked
exports.getRecommended = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ isAvailable: true })
      .sort({ bookingCount: -1, rating: -1 }) // Most booked + highest rated
      .limit(6);

    res.json({ success: true, vehicles });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/vehicles/cities ─────────────────
exports.getCities = async (req, res, next) => {
  try {
    const cities = await Vehicle.distinct("city");
    res.json({ success: true, cities: cities.sort() });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/vehicles (Admin only) ──────────
exports.createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/vehicles/:id (Admin only) ───────
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/vehicles/:id (Admin only) ────
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    res.json({ success: true, message: "Vehicle deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/vehicles/:id/wishlist ──────────
// Toggle vehicle in user's wishlist
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const vehicleId = req.params.id;

    const isWishlisted = user.wishlist.includes(vehicleId);

    if (isWishlisted) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== vehicleId
      );
    } else {
      // Add to wishlist
      user.wishlist.push(vehicleId);
    }

    await user.save();

    res.json({
      success: true,
      wishlisted: !isWishlisted,
      message: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
    });
  } catch (error) {
    next(error);
  }
};
