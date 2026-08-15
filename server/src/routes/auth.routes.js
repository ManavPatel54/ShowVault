const express = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route — requires valid JWT
router.get("/me", protect, getMe);

module.exports = router;
