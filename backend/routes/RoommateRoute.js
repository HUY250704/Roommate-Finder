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
 *     summary: L?y danh s�ch nh?ng ng�?i t?m ph?ng gh�p k�m b? l?c
 *     tags: [Roommates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
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
 *         description: Paginated roommate profiles with total count
 */
router.get('/', protect, getRoommates);

/**
 * @swagger
 * /api/roommates/{id}:
 *   get:
 *     summary: Xem chi ti?t h? s� t?m ph?ng gh�p c?a m?t ng�?i d�ng theo ID
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
 *         description: Tr? v? th�ng tin h? s� chi ti?t
 *       404:
 *         description: Kh�ng t?m th?y h? s�
 */
router.get('/:id', protect, getRoommateById);

module.exports = router;
