const express = require('express');
const { searchUsers, getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/search', searchUsers);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
