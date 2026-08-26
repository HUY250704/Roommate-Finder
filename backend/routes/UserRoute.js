const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getDashboardStats,
  manageUsers,
} = require('../controllers/UserController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and administration
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: L?y h? sõ cá nhân c?a ngý?i dùng hi?n t?i
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tr? v? thông tin Profile thành công
 *       401:
 *         description: Không có quy?n truy c?p
 */
router.get('/me', protect, getProfile);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: C?p nh?t h? sõ cá nhân và l?i s?ng c?a ngý?i dùng hi?n t?i
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, ""]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               avatar:
 *                 type: string
 *               bio:
 *                 type: string
 *               lifestyle:
 *                 type: object
 *                 properties:
 *                   smoking:
 *                     type: string
 *                     enum: [non-smoker, smoker, occasional, no-preference]
 *                   pets:
 *                     type: string
 *                     enum: ["no pets", "has pets", "pet friendly"]
 *                   sleepSchedule:
 *                     type: string
 *                     enum: [early bird, night owl, flexible]
 *                   cleanliness:
 *                     type: string
 *                     enum: [high, medium, low]
 *                   hobbies:
 *                     type: array
 *                     items:
 *                       type: string
 *               searchPreferences:
 *                 type: object
 *                 properties:
 *                   budgetMin:
 *                     type: number
 *                   budgetMax:
 *                     type: number
 *                   location:
 *                     type: string
 *                   preferredGender:
 *                     type: string
 *                     enum: [male, female, other, any]
 *     responses:
 *       200:
 *         description: C?p nh?t h? sõ thành công
 *       401:
 *         description: Không có quy?n truy c?p
 */
router.put('/me', protect, updateProfile);

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
