const express = require('express');
const router = express.Router();
const { createReport, handleReports, updateReportStatus } = require('../controllers/ReportController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reporting violations (safety & moderation)
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: G?i báo cáo vi ph?m (ngý?i dùng ho?c ph?ng tr?)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reportedUserId:
 *                 type: string
 *               reportedRoomId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 example: "Scam"
 *               details:
 *                 type: string
 *                 example: "Ph?ng này không có th?t, h?nh ?nh gi? m?o."
 *     responses:
 *       201:
 *         description: Báo cáo thành công
 */
router.post('/', protect, createReport);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Xem danh sách báo cáo vi ph?m (Ch? dành cho Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tr? v? danh sách báo cáo thành công
 */
router.get('/', protect, handleReports);

/**
 * @swagger
 * /api/reports/{id}:
 *   put:
 *     summary: C?p nh?t tr?ng thái x? l? báo cáo (Ch? dành cho Admin)
 *     tags: [Reports]
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
 *         description: C?p nh?t thành công
 */
router.put('/:id', protect, updateReportStatus);

module.exports = router;
