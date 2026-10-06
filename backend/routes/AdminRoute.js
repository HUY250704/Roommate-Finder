const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics,
  getUsers,
  manageUsers,
  getAdminRooms,
  updateRoomStatus,
  approveRoom,
  rejectRoom,
  manageRooms,
  handleReports,
  updateReportStatus,
} = require('../controllers/AdminController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrator control panel, analytics, user moderation, room approval, and reports
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Xem thống kê tổng quan và phân tích hệ thống (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về số liệu thống kê thành công
 *       403:
 *         description: Từ chối truy cập do thiếu quyền Admin
 */
router.get('/stats', protect, getDashboardStats);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Xem chi tiết phân tích tăng trưởng, khu vực, giá thuê và match (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về phân tích thành công
 */
router.get('/analytics', protect, getAnalytics);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lấy danh sách người dùng để quản lý/kiểm duyệt (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, banned, suspended]
 *       - name: role
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *       - name: isVerified
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về danh sách người dùng thành công
 */
router.get('/users', protect, getUsers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Quản lý tài khoản người dùng (Ban, Unban, Verify, Unverify, Warn, Make Admin, Delete)
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
 *                 enum: [ban, unban, suspend, activate, verify, unverify, warn, make_admin, remove_admin, delete]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thực hiện hành động thành công
 */
router.post('/users', protect, manageUsers);
router.put('/users/:userId', protect, manageUsers);

/**
 * @swagger
 * /api/admin/rooms:
 *   get:
 *     summary: Xem danh sách tin đăng phòng (tất cả trạng thái: pending, approved, available, rejected, v.v.)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [all, pending, approved, available, rented, rejected, removed]
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về danh sách tin đăng phòng cho Admin
 */
router.get('/rooms', protect, getAdminRooms);

/**
 * @swagger
 * /api/admin/rooms/{roomId}/status:
 *   put:
 *     summary: Duyệt hoặc cập nhật trạng thái tin đăng phòng (approved, rejected, removed, available, pending)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roomId
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
 *                 enum: [approved, rejected, removed, available, pending]
 *               action:
 *                 type: string
 *                 enum: [approve, reject, remove]
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái tin đăng thành công
 */
router.put('/rooms/:roomId/status', protect, updateRoomStatus);
router.post('/rooms/:roomId/approve', protect, approveRoom);
router.post('/rooms/:roomId/reject', protect, rejectRoom);

/**
 * @swagger
 * /api/admin/rooms/{roomId}:
 *   delete:
 *     summary: Admin xóa phòng vi phạm chính sách
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
 *         description: Xóa phòng thành công
 */
router.delete('/rooms/:roomId', protect, manageRooms);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Xem danh sách các báo cáo vi phạm
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, resolved, dismissed]
 *     responses:
 *       200:
 *         description: Trả về danh sách báo cáo thành công
 */
router.get('/reports', protect, handleReports);

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   put:
 *     summary: Cập nhật trạng thái xử lý báo cáo vi phạm và thực hiện hành động (warn/ban/remove_room/...)
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [resolved, dismissed, pending]
 *               action:
 *                 type: string
 *                 enum: [warn, ban, unban, remove_room, delete_room, approve_room, reject_room]
 *               notes:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái báo cáo thành công
 */
router.put('/reports/:id', protect, updateReportStatus);
router.post('/reports/:id/action', protect, updateReportStatus);

module.exports = router;