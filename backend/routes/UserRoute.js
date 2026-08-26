const express = require('express');
const router = express.Router();
const { getDashboardStats, manageUsers } = require('../controllers/UserController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User administration and stats
 */

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Xem th?ng kê h? th?ng (Ch? dành cho Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: L?y s? li?u th?ng kê thành công
 *       403:
 *         description: T? ch?i truy c?p (Không ph?i Admin)
 */
router.get('/stats', protect, getDashboardStats);

/**
 * @swagger
 * /api/users/users:
 *   post:
 *     summary: Admin qu?n l? ngý?i dùng (xóa user / phong c?p admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - action
 *             properties:
 *               userId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [delete, make_admin]
 *     responses:
 *       200:
 *         description: Th?c hi?n hành ð?ng thành công
 *       403:
 *         description: Không có quy?n truy c?p
 */
router.post('/users', protect, manageUsers);

module.exports = router;
