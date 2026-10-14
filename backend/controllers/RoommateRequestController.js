const RoommateRequest = require('../models/RoommateRequest');
const User = require('../models/User');
const mongoose = require('mongoose');
const { createNotification } = require('../services/notificationService');
const { getBlockedUserIds, isBlockedBetween } = require('./BlockController');

const getPeople = async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const blockedIds = await getBlockedUserIds(req.user._id);
    const excludedIds = [req.user._id, ...blockedIds];

    const query = {
      _id: { $nin: excludedIds },
      role: 'user',
    };
    if (escapedSearch) query.username = { $regex: escapedSearch, $options: 'i' };

    const people = await User.find(query)
      .select('_id username avatar')
      .sort({ username: 1 })
      .limit(20);

    return res.status(200).json(people);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sendRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    if (req.user._id.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const blocked = await isBlockedBetween(req.user._id, receiverId);
    if (blocked) {
      return res.status(403).json({ message: 'Cannot send request: User is blocked' });
    }

    const receiver = await User.findById(receiverId).select('_id role status isBanned');
    if (!receiver || receiver.role !== 'user' || receiver.status === 'banned' || receiver.isBanned) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = await RoommateRequest.findOne({
      status: { $in: ['pending', 'accepted'] },
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already exists between users' });
    }

    const request = await RoommateRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
    });

    // Notify receiver
    try {
      const io = req.app.get('io');
      await createNotification(
        receiverId,
        req.user._id,
        'roommate_request',
        'New Roommate Request',
        `${req.user.username} has sent you a roommate request.`,
        request._id,
        io
      );
    } catch (notifErr) {
      console.error('Failed to send roommate request notification:', notifErr.message);
    }

    return res.status(201).json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await RoommateRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    request.status = status;
    await request.save();

    // Notify sender about response
    try {
      const io = req.app.get('io');
      const title = status === 'accepted' ? 'Roommate Request Accepted' : 'Roommate Request Rejected';
      const notifMessage = status === 'accepted'
        ? `${req.user.username} accepted your roommate request. Chat is now unlocked!`
        : `${req.user.username} declined your roommate request.`;
      await createNotification(
        request.sender,
        req.user._id,
        'match',
        title,
        notifMessage,
        request._id,
        io
      );
    } catch (notifErr) {
      console.error('Failed to send response notification:', notifErr.message);
    }

    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await RoommateRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'username email avatar')
      .populate('receiver', 'username email avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPeople,
  sendRequest,
  respondToRequest,
  getMyRequests,
};