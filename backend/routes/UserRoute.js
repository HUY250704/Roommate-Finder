const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getDashboardStats,
  manageUsers,
} = require('../controllers/UserController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users & Auth
 *   description: User registration, authentication and administration
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Ðãng k? tài kho?n ngý?i dùng m?i
 *     tags: [Users & Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               email:
 *                 type: string
 *                 example: testuser@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: T?o tài kho?n thành công
 *       400:
 *         description: Yêu c?u không h?p l? ho?c tài kho?n ð? t?n t?i
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Ðãng nh?p tài kho?n ngý?i dùng
 *     tags: [Users & Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: testuser@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Ðãng nh?p thành công và tr? v? JWT Token
 *       401:
 *         description: Thông tin ðãng nh?p không chính xác
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Ðãng xu?t ngý?i dùng
 *     tags: [Users & Auth]
 *     responses:
 *       200:
 *         description: Ðãng xu?t thành công
 */
router.post('/logout', logoutUser);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Xem th?ng kê h? th?ng (Ch? dành cho Admin)
 *     tags: [Users & Auth]
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
 *     tags: [Users & Auth]
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
