/**
 * Users Controller
 * Allows searching/looking up users (used when adding members to projects).
 */

const User = require('../models/User');

// GET /api/users/search?email=...
const searchUsers = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email query param required' });
    }

    const users = await User.find({
      email: { $regex: email, $options: 'i' },
    }).select('name email').limit(10);

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/profile - Get own profile
const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// PUT /api/users/profile - Update own name
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    req.user.name = name || req.user.name;
    await req.user.save();
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchUsers, getProfile, updateProfile };
