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
 *     summary: G?i yêu c?u xem ph?ng
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
 *                 example: "M?nh mu?n xem ph?ng vào chi?u t?i mai có ti?n không?"
 *     responses:
 *       201:
 *         description: G?i yêu c?u thành công
 */
router.post('/', protect, requestViewing);

/**
 * @swagger
 * /api/viewings/{id}:
 *   put:
 *     summary: Duy?t ho?c t? ch?i yêu c?u xem ph?ng (Ch? ch? ph?ng)
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
 *         description: C?p nh?t thành công
 */
router.put('/:id', protect, handleViewing);

/**
 * @swagger
 * /api/viewings:
 *   get:
 *     summary: L?y danh sách l?ch xem ph?ng liên quan ð?n ngý?i dùng hi?n t?i
 *     tags: [Viewings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tr? v? danh sách thành công
 */
router.get('/', protect, getViewings);

module.exports = router;
