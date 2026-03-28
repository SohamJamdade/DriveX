/**
 * USER CONTROLLER (Admin operations)
 */

const User = require("../models/User");
const Booking = require("../models/Booking");

// ─── GET /api/users (Admin only) ──────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort("-createdAt").skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, count: users.length, total, users });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/:id/status (Admin only) ───
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, user, message: `User ${user.isActive ? "activated" : "deactivated"}.` });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users/stats (Admin only) ────────
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalBookings, revenueData] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        totalRevenue: revenueData[0]?.total || 0,
        bookingsByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
