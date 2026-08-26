const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getRoommates, getRoommateById } = require('../controllers/ProfileController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/roommates', protect, getRoommates);
router.get('/roommates/:id', protect, getRoommateById);

module.exports = router;
