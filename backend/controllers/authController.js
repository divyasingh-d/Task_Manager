/**
 * Auth Controller
 * Handles user registration, login, and profile retrieval.
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Generate a signed JWT for a given user id
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check for existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user (password is hashed by the pre-save hook in the model)
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it's excluded by default via `select: false`)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is attached by the protect middleware
  res.json({ success: true, user: req.user });
};

module.exports = { signup, login, getMe };
