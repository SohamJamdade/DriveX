/**
 * AUTH ROUTES
 */
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Validation rules
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be 6+ characters"),
];

const loginRules = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerRules, register);
router.post("/login", loginRules, login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

module.exports = router;
