const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/NotificationController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: L?y danh sách thông báo cá nhân
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: L?y danh sách thành công
 */
router.get('/', protect, getNotifications);

/**
 * @swagger
 * /api/notifications/read:
 *   put:
 *     summary: Ðánh d?u t?t c? thông báo là ð? ð?c
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ðánh d?u thành công
 */
router.put('/read', protect, markAsRead);

module.exports = router;
