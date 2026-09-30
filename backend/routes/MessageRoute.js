const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getConversations, getChatContacts } = require('../controllers/MessageController');
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
 *     summary: L?y danh s�ch c�c cu?c h?i tho?i
 *     tags: [Chats & Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tr? v? danh s�ch h?i tho?i th�nh c�ng
 */
router.get('/', protect, getConversations);
router.get('/contacts', protect, getChatContacts);

/**
 * @swagger
 * /api/conversations/messages/{conversationId}:
 *   get:
 *     summary: L?y danh s�ch tin nh?n trong m?t cu?c h?i tho?i
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
 *         description: Tr? v? danh s�ch tin nh?n th�nh c�ng
 */
router.get('/messages/:conversationId', protect, getMessages);

/**
 * @swagger
 * /api/conversations/messages:
 *   post:
 *     summary: G?i tin nh?n m?i (ph�t realtime qua Socket.io)
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
 *                 example: Ch�o b?n, ph?ng n�y c� c?n �?t c?c tr�?c nhi?u kh�ng ??
 *     responses:
 *       201:
 *         description: G?i tin nh?n th�nh c�ng
 */
router.post('/messages', protect, sendMessage);

module.exports = router;
