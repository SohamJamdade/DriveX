/**
 * AUTH CONTROLLER
 * Handles user registration, login, and profile management
 */

const User = require("../models/User");
const { validationResult } = require("express-validator");

// ─── Helper: Send JWT Response ─────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwt();

  // Don't send password back
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    wishlist: user.wishlist,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

// ─── POST /api/auth/register ───────────────────
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create user (password gets hashed by pre-save hook in model)
    const user = await User.create({ name, email, password, phone });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ──────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with password (select: false in model hides it by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ──────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id).populate("wishlist", "name brand images pricePerDay type");
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/auth/profile ─────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/auth/password ────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    await user.save(); // Triggers pre-save hash hook

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
