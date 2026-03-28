/**
 * MongoDB Connection Configuration
 * Uses Mongoose to connect to MongoDB Atlas or local instance
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options prevent deprecation warnings
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure so the server doesn't run without a DB
    process.exit(1);
  }
};

module.exports = connectDB;
