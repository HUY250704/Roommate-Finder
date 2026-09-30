const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const RoommateRequest = require('../models/RoommateRequest');
const mongoose = require('mongoose');

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const conversation = await Conversation.findById(conversationId).select('participants');
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.some(participant => participant.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username email avatar')
      .sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    let { conversationId } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Message text is required' });
    }
    if (text.length > 5000) {
      return res.status(400).json({ message: 'Message must be 5000 characters or fewer' });
    }
    if (!recipientId && !conversationId) {
      return res.status(400).json({ message: 'Please provide recipientId or conversationId' });
    }

    let targetRecipientId = recipientId;

    let conversation;
    if (conversationId) {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID' });
      }
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      if (!conversation.participants.some(participant => participant.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'You are not a participant in this conversation' });
      }
      targetRecipientId = conversation.participants.find(
        participant => participant.toString() !== req.user._id.toString()
      );
    } else {
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        return res.status(400).json({ message: 'Invalid recipient ID' });
      }
      if (recipientId.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot send a message to yourself' });
      }
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId], $size: 2 }
      });
    }

    const acceptedRequest = await RoommateRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: targetRecipientId, status: 'accepted' },
        { sender: targetRecipientId, receiver: req.user._id, status: 'accepted' }
      ]
    });

    if (!acceptedRequest) {
      return res.status(403).json({
        message: 'Chat locked. You must have an accepted roommate request with this user to chat.'
      });
    }

    if (!targetRecipientId) {
      return res.status(400).json({ message: 'Recipient not found' });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, targetRecipientId]
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email avatar');

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
        populate: { path: 'sender', select: 'username avatar' }
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getChatContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const acceptedRequests = await RoommateRequest.find({
      status: 'accepted',
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'username email avatar')
      .populate('receiver', 'username email avatar')
      .sort({ updatedAt: -1 });

    const contactsById = new Map();
    for (const request of acceptedRequests) {
      if (!request.sender || !request.receiver) continue;
      const contact = request.sender._id.toString() === userId.toString()
        ? request.receiver
        : request.sender;
      if (contactsById.has(contact._id.toString())) continue;
      contactsById.set(contact._id.toString(), {
        id: contact._id,
        name: contact.username,
        email: contact.email,
        avatar: contact.avatar,
        requestId: request._id,
      });
    }

    const contacts = [...contactsById.values()];
    const conversations = await Conversation.find({
      participants: { $all: [userId], $size: 2 },
    }).select('_id participants updatedAt');
    const conversationByContact = new Map();
    for (const conversation of conversations) {
      const contactId = conversation.participants.find(
        participant => participant.toString() !== userId.toString()
      )?.toString();
      if (contactId) conversationByContact.set(contactId, conversation._id);
    }

    return res.status(200).json(contacts.map(contact => ({
      ...contact,
      conversationId: conversationByContact.get(contact.id.toString()) || null,
    })));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  getConversations,
  getChatContacts,
};
