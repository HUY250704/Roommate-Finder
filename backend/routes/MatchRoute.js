const express = require('express');
const router = express.Router();
const { calculateMatch, getMatches } = require('../controllers/MatchController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Compatibility matching system
 */

/**
 * @swagger
 * /api/matches/calculate:
 *   post:
 *     summary: Tính toán ð? týõng thích (%) v?i m?t ngý?i dùng m?c tiêu và lýu k?t qu?
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 example: 60b9f07a2d480d19a4e4d586
 *     responses:
 *       200:
 *         description: Tr? v? k?t qu? ð?i sánh thành công
 *       400:
 *         description: Thông tin không h?p l?
 *       404:
 *         description: Không t?m th?y h? sõ ngý?i dùng ð? so sánh
 */
router.post('/calculate', protect, calculateMatch);

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Xem danh sách các k?t qu? ð?i sánh (matching) s?p x?p theo ð? týõng thích gi?m d?n
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tr? v? danh sách ð?i sánh thành công
 */
router.get('/', protect, getMatches);

module.exports = router;
