const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  manageUsers,
  manageRooms,
  handleReports,
  updateReportStatus,
} = require('../controllers/AdminController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrator control panel and moderation
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Xem th?ng kê t?ng quan h? th?ng (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tr? v? s? li?u th?ng kê thành công
 *       403:
 *         description: T? ch?i truy c?p do thi?u quy?n Admin
 */
router.get('/stats', protect, getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Qu?n l? tài kho?n ngý?i dùng (Xóa user / C?p quy?n Admin)
 *     tags: [Admin]
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
 */
router.post('/users', protect, manageUsers);

/**
 * @swagger
 * /api/admin/rooms/{roomId}:
 *   delete:
 *     summary: Admin xóa ph?ng vi ph?m chính sách
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roomId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa ph?ng thành công
 */
router.delete('/rooms/:roomId', protect, manageRooms);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Xem danh sách các báo cáo vi ph?m
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tr? v? danh sách báo cáo thành công
 */
router.get('/reports', protect, handleReports);

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   put:
 *     summary: C?p nh?t tr?ng thái x? l? báo cáo vi ph?m
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [resolved, dismissed]
 *     responses:
 *       200:
 *         description: C?p nh?t tr?ng thái báo cáo thành công
 */
router.put('/reports/:id', protect, updateReportStatus);

module.exports = router;
