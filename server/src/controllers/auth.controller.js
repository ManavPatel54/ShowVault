const User = require("../models/user.model");
const { generateAccessToken } = require("../utils/token");

// ---------------------------------------------------------------------------
// Helper — builds the safe public user object (no password, no __v)
// ---------------------------------------------------------------------------
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // --- Field presence validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    // --- Email format validation (RFC-ish, deliberately lightweight) ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // --- Minimum password length ---
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // --- Duplicate email check ---
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // --- Create user (password is hashed by the pre-save hook) ---
    const user = await User.create({ name, email, password });

    // --- Issue access token ---
    const accessToken = generateAccessToken({ userId: user._id, role: user.role });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: safeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Field presence validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // --- Fetch user — explicitly select password (excluded by default) ---
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    // --- Generic error: do not reveal whether email or password was wrong ---
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // --- Compare plaintext candidate against stored hash ---
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // --- Issue access token ---
    const accessToken = generateAccessToken({ userId: user._id, role: user.role });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: safeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/auth/me  (protected — requires valid JWT via auth middleware)
// ---------------------------------------------------------------------------
const getMe = async (req, res) => {
  try {
    // req.user is populated by auth.middleware.js — no password needed here
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: safeUser(user),
      },
    });
  } catch (error) {
    console.error("GetMe error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not fetch user. Please try again later.",
    });
  }
};

module.exports = { register, login, getMe };
