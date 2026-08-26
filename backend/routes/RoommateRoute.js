const express = require('express');
const router = express.Router();
const { getRoommates, getRoommateById } = require('../controllers/ProfileController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Roommates
 *   description: Roommate search and details
 */

/**
 * @swagger
 * /api/roommates:
 *   get:
 *     summary: L?y danh sách nh?ng ngý?i t?m ph?ng ghép kèm b? l?c
 *     tags: [Roommates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: gender
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: location
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: minBudget
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *       - name: maxBudget
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *       - name: smoking
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: pets
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: sleepSchedule
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: cleanliness
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tr? v? danh sách roommates thành công
 */
router.get('/', protect, getRoommates);

/**
 * @swagger
 * /api/roommates/{id}:
 *   get:
 *     summary: Xem chi ti?t h? sõ t?m ph?ng ghép c?a m?t ngý?i dùng theo ID
 *     tags: [Roommates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tr? v? thông tin h? sõ chi ti?t
 *       404:
 *         description: Không t?m th?y h? sõ
 */
router.get('/:id', protect, getRoommateById);

module.exports = router;
