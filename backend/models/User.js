/**
 * USER MODEL
 * Stores user accounts with role-based access control
 * Passwords are hashed with bcrypt before saving
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries by default
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    phone: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      default: "", // URL to profile picture
    },

    // Vehicles user has wishlisted/favorited
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Hash Password Before Saving ──────────────
// This middleware runs before every .save() call
userSchema.pre("save", async function (next) {
  // Only hash if password was actually modified (not on other updates)
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12); // 12 rounds is a good security/performance balance
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Methods ─────────────────────────

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate a signed JWT token for this user
userSchema.methods.getSignedJwt = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

module.exports = mongoose.model("User", userSchema);
