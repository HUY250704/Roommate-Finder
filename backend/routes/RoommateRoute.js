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
 *     summary: Search roommate profiles with optional filters
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
 *         description: Paginated roommate profiles without private email addresses
 *       400:
 *         description: Page and limit must be positive integers
 */
router.get('/', protect, getRoommates);

/**
 * @swagger
 * /api/roommates/{id}:
 *   get:
 *     summary: View a roommate profile by user ID
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
 *         description: Roommate profile returned successfully
 *       404:
 *         description: Roommate profile not found
 */
router.get('/:id', protect, getRoommateById);

module.exports = router;
