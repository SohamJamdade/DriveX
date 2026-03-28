/**
 * USER ROUTES (Admin management)
 */
const express = require("express");
const router = express.Router();
const { getAllUsers, toggleUserStatus, getStats } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/", getAllUsers);
router.get("/stats", getStats);
router.put("/:id/status", toggleUserStatus);

module.exports = router;
