const express = require('express');
const router = express.Router();
const { requestViewing, handleViewing, getViewings } = require('../controllers/ViewingController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Viewings
 *   description: Request and approve room viewings
 */

/**
 * @swagger
 * /api/viewings:
 *   post:
 *     summary: G?i y�u c?u xem ph?ng
 *     tags: [Viewings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - date
 *             properties:
 *               roomId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-28T18:30:00Z"
 *               message:
 *                 type: string
 *                 example: "M?nh mu?n xem ph?ng v�o chi?u t?i mai c� ti?n kh�ng?"
 *     responses:
 *       201:
 *         description: G?i y�u c?u th�nh c�ng
 *       400:
 *         description: Missing fields, invalid date, or viewing date is not in the future
 *       409:
 *         description: A pending viewing request already exists for this room and date
 */
router.post('/', protect, requestViewing);

/**
 * @swagger
 * /api/viewings/{id}:
 *   put:
 *     summary: Duy?t ho?c t? ch?i y�u c?u xem ph?ng (Ch? ch? ph?ng)
 *     tags: [Viewings]
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
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: C?p nh?t th�nh c�ng
 */
router.put('/:id', protect, handleViewing);

/**
 * @swagger
 * /api/viewings:
 *   get:
 *     summary: L?y danh s�ch l?ch xem ph?ng li�n quan �?n ng�?i d�ng hi?n t?i
 *     tags: [Viewings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tr? v? danh s�ch th�nh c�ng
 */
router.get('/', protect, getViewings);

module.exports = router;
