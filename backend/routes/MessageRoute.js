const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getConversations } = require('../controllers/MessageController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);

module.exports = router;
