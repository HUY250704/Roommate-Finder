const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username email')
      .sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    let { conversationId } = req.body;

    if (!recipientId && !conversationId) {
      return res.status(400).json({ message: 'Please provide recipientId or conversationId' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else {
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId] }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user._id, recipientId]
        });
      }
    }

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email');

    const io = req.app.get('io');
    if (io) {
      conversation.participants.forEach(participantId => {
        io.to(participantId.toString()).emit('messageReceived', populatedMessage);
      });
    }

    return res.status(201).json(populatedMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'username email')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username' }
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  getConversations,
};
