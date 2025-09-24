const express = require("express");
const router = express.Router();  // small --> app

// Import controller functions (destructured)
const { registerUser, loginUser } = require("../controllers/authController");

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

module.exports = router;
