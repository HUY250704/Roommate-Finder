const express = require('express');
const router = express.Router();
const { sendRequest, handleRequest, getRequests } = require('../controllers/RoommateRequestController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Roommate Requests
 *   description: Send and respond to roommate requests
 */

/**
 * @swagger
 * /api/roommate-requests:
 *   post:
 *     summary: G?i yêu c?u ghép ph?ng m?i t?i m?t ngý?i dùng
 *     tags: [Roommate Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: string
 *               message:
 *                 type: string
 *                 example: M?nh th?y l?i s?ng c?a t?i m?nh r?t h?p nhau, hi v?ng ðý?c ghép ph?ng cùng b?n!
 *     responses:
 *       201:
 *         description: G?i thành công
 *       400:
 *         description: L?i ð?u vào ho?c yêu c?u ð? t?n t?i
 */
router.post('/', protect, sendRequest);

/**
 * @swagger
 * /api/roommate-requests/{id}:
 *   put:
 *     summary: Ð?ng ? ho?c t? ch?i yêu c?u ghép ph?ng
 *     tags: [Roommate Requests]
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
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Ph?n h?i thành công
 */
router.put('/:id', protect, handleRequest);

/**
 * @swagger
 * /api/roommate-requests:
 *   get:
 *     summary: L?y danh sách yêu c?u ð? nh?n và ð? g?i c?a ngý?i dùng hi?n t?i
 *     tags: [Roommate Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: L?y danh sách thành công
 */
router.get('/', protect, getRequests);

module.exports = router;
