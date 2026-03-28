/**
 * ==============================================
 * VEHICLE RENTING PLATFORM - MAIN SERVER FILE
 * ==============================================
 * Entry point for the Express.js backend
 * Sets up middleware, routes, and DB connection
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

// Load env vars first
dotenv.config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const bookingRoutes = require("./routes/bookings");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security Middleware ───────────────────────
app.use(helmet()); // Sets security HTTP headers

// Rate limiting: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// ─── CORS ─────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// ─── Body Parsers ──────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Colorized request logging in dev
}

// ─── Health Check ─────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Vehicle Renting API is running!",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

// ─── 404 Handler ──────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚗 Vehicle Renting API Server`);
  console.log(`📡 Running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}/api/health\n`);
});

// Handle unhandled promise rejections (e.g., DB connection fails)
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
