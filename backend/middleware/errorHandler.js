/**
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * Catches all errors thrown in controllers and formats them consistently
 * Must have 4 params (err, req, res, next) for Express to recognize it as error handler
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for server debugging (in dev only)
  if (process.env.NODE_ENV === "development") {
    console.error("🔴 Error:", err);
  }

  // ─── Mongoose: Bad ObjectId ────────────────
  // e.g., /api/vehicles/not-a-valid-id
  if (err.name === "CastError") {
    error = {
      message: `Resource not found with id: ${err.value}`,
      statusCode: 404,
    };
  }

  // ─── Mongoose: Duplicate Key ────────────────
  // e.g., email already exists
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      message: `${field} already exists. Please use a different value.`,
      statusCode: 400,
    };
  }

  // ─── Mongoose: Validation Error ─────────────
  // e.g., required field missing
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = {
      message: messages.join(". "),
      statusCode: 400,
    };
  }

  // ─── JWT Errors ──────────────────────────────
  if (err.name === "JsonWebTokenError") {
    error = { message: "Invalid token. Please log in again.", statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    error = { message: "Token expired. Please log in again.", statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
