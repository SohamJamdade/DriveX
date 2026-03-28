/**
 * AUTHENTICATION MIDDLEWARE
 * Protects routes by verifying JWT tokens
 * Also provides role-based access control
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Protect: Require Valid JWT ────────────────
exports.protect = async (req, res, next) => {
  let token;

  // JWT is sent in Authorization header as "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Please log in.",
    });
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object (without password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token may be invalid.",
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

// ─── Authorize: Role-Based Access Control ─────
// Usage: authorize("admin") or authorize("admin", "user")
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not allowed to access this route.`,
      });
    }
    next();
  };
};
