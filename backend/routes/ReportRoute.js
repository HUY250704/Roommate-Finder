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
 *     summary: Gửi báo cáo vi phạm (người dùng hoặc tin đăng phòng)
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
 *                 enum: [Scam, Fake listing, Harassment, Inappropriate content, Other]
 *                 example: "Scam"
 *               details:
 *                 type: string
 *                 example: "Phòng này không có thật, hình ảnh giả mạo."
 *     responses:
 *       201:
 *         description: Báo cáo thành công
 *       400:
 *         description: Thiếu đối tượng hoặc lý do không hợp lệ
 */
router.post('/', protect, createReport);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Xem danh sách báo cáo vi phạm (Chỉ dành cho Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách báo cáo thành công
 */
router.get('/', protect, handleReports);

/**
 * @swagger
 * /api/reports/{id}:
 *   put:
 *     summary: Cập nhật trạng thái xử lý báo cáo (Chỉ dành cho Admin)
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, resolved, dismissed]
 *               action:
 *                 type: string
 *                 enum: [warn, ban, unban, remove_room, delete_room, approve_room, reject_room]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', protect, updateReportStatus);

module.exports = router;