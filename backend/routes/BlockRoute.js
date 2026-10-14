const express = require('express');
const router = express.Router();
const { blockUser, unblockUser, getBlockedUsers } = require('../controllers/BlockController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Blocks
 *   description: Block and unblock users for safety & privacy
 */

/**
 * @swagger
 * /api/blocks:
 *   get:
 *     summary: Lấy danh sách người dùng đã bị chặn
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách người dùng bị chặn
 */
router.get('/', protect, getBlockedUsers);

/**
 * @swagger
 * /api/blocks:
 *   post:
 *     summary: Chặn một người dùng
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blockedUserId
 *             properties:
 *               blockedUserId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chặn người dùng thành công
 */
router.post('/', protect, blockUser);

/**
 * @swagger
 * /api/blocks/{userId}:
 *   post:
 *     summary: Chặn một người dùng theo ID trong params
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Chặn thành công
 */
router.post('/:userId', protect, blockUser);

/**
 * @swagger
 * /api/blocks/{userId}:
 *   delete:
 *     summary: Bỏ chặn một người dùng
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bỏ chặn thành công
 */
router.delete('/:userId', protect, unblockUser);

module.exports = router;