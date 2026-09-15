const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/ProfileController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: User profile management
 */

/**
 * @swagger
 * /api/profiles/profile:
 *   get:
 *     summary: Lấy hồ sơ người dùng hiện tại
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin hồ sơ
 */
router.get('/profile', protect, getProfile);

/**
 * @swagger
 * /api/profiles/profile:
 *   put:
 *     summary: Cập nhật hồ sơ người dùng hiện tại
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hồ sơ đã được cập nhật thành công
 */
router.put('/profile', protect, updateProfile);

module.exports = router;