const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getConversations } = require('../controllers/MessageController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Chats & Conversations
 *   description: Real-time chat and message management
 */

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: L?y danh sách các cu?c h?i tho?i
 *     tags: [Chats & Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tr? v? danh sách h?i tho?i thành công
 */
router.get('/', protect, getConversations);

/**
 * @swagger
 * /api/conversations/messages/{conversationId}:
 *   get:
 *     summary: L?y danh sách tin nh?n trong m?t cu?c h?i tho?i
 *     tags: [Chats & Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tr? v? danh sách tin nh?n thành công
 */
router.get('/messages/:conversationId', protect, getMessages);

/**
 * @swagger
 * /api/conversations/messages:
 *   post:
 *     summary: G?i tin nh?n m?i (phát realtime qua Socket.io)
 *     tags: [Chats & Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               recipientId:
 *                 type: string
 *               conversationId:
 *                 type: string
 *               text:
 *                 type: string
 *                 example: Chào b?n, ph?ng này có c?n ð?t c?c trý?c nhi?u không ??
 *     responses:
 *       201:
 *         description: G?i tin nh?n thành công
 */
router.post('/messages', protect, sendMessage);

module.exports = router;
