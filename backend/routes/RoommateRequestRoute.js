const express = require('express');
const router = express.Router();
const { getPeople, sendRequest, handleRequest, getRequests } = require('../controllers/RoommateRequestController');
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
 *     summary: G?i y�u c?u gh�p ph?ng m?i t?i m?t ng�?i d�ng
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
 *                 example: M?nh th?y l?i s?ng c?a t?i m?nh r?t h?p nhau, hi v?ng ��?c gh�p ph?ng c�ng b?n!
 *     responses:
 *       201:
 *         description: G?i th�nh c�ng
 *       400:
 *         description: L?i �?u v�o ho?c y�u c?u �? t?n t?i
 */
router.get('/people', protect, getPeople);
router.post('/', protect, sendRequest);

/**
 * @swagger
 * /api/roommate-requests/{id}:
 *   put:
 *     summary: �?ng ? ho?c t? ch?i y�u c?u gh�p ph?ng
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
 *         description: Ph?n h?i th�nh c�ng
 */
router.put('/:id', protect, handleRequest);

/**
 * @swagger
 * /api/roommate-requests:
 *   get:
 *     summary: L?y danh s�ch y�u c?u �? nh?n v� �? g?i c?a ng�?i d�ng hi?n t?i
 *     tags: [Roommate Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: L?y danh s�ch th�nh c�ng
 */
router.get('/', protect, getRequests);

module.exports = router;
