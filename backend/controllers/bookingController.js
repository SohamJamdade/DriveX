/**
 * BOOKING CONTROLLER
 * Handles the complete booking lifecycle with double-booking prevention
 */

const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

// ─── POST /api/bookings ────────────────────────
// Create a new booking with availability check
exports.createBooking = async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate, notes } = req.body;

    // 1. Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past.",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date.",
      });
    }

    // 2. Check vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This vehicle is not available for booking.",
      });
    }

    // 3. CHECK FOR DATE CONFLICTS (the double-booking prevention!)
    // This checks if ANY existing confirmed booking overlaps with requested dates
    const isAvailable = await Booking.checkAvailability(vehicleId, start, end);

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is already booked for the selected dates. Please choose different dates.",
      });
    }

    // 4. Calculate cost
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * vehicle.pricePerDay;

    // 5. Create the booking
    const booking = await Booking.create({
      user: req.user.id,
      vehicle: vehicleId,
      startDate: start,
      endDate: end,
      totalDays,
      pricePerDay: vehicle.pricePerDay,
      totalAmount,
      pickupCity: vehicle.city,
      notes,
    });

    // 6. Increment vehicle's booking count (for recommendations)
    await Vehicle.findByIdAndUpdate(vehicleId, {
      $inc: { bookingCount: 1 },
    });

    // 7. Populate and return
    await booking.populate("vehicle", "name brand images type city");
    await booking.populate("user", "name email phone");

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/bookings/my ──────────────────────
// Get current user's bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    // Update statuses first (active/completed based on dates)
    await Booking.updateStatuses();

    const bookings = await Booking.find({ user: req.user.id })
      .populate("vehicle", "name brand images type pricePerDay city")
      .sort("-createdAt"); // Most recent first

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/bookings/:id ────────────────────
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("vehicle")
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // Only the booking owner or admin can view it
    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/bookings/:id/cancel ─────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // Only owner or admin can cancel
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    // Can't cancel already completed or cancelled bookings
    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking.`,
      });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || "Cancelled by user";
    await booking.save();

    res.json({ success: true, booking, message: "Booking cancelled successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/bookings (Admin only) ───────────
exports.getAllBookings = async (req, res, next) => {
  try {
    await Booking.updateStatuses();

    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("vehicle", "name brand images type")
        .populate("user", "name email phone")
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    // Revenue stats
    const stats = await Booking.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      stats: stats[0] || { totalRevenue: 0, count: 0 },
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/bookings/vehicle/:vehicleId/availability ─────
// Check if a vehicle is available for specific dates (public)
exports.checkAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required.",
      });
    }

    const isAvailable = await Booking.checkAvailability(
      req.params.vehicleId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({ success: true, isAvailable });
  } catch (error) {
    next(error);
  }
};
