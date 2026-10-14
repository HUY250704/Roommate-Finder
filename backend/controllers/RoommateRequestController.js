const RoommateRequest = require('../models/RoommateRequest');
const User = require('../models/User');
const mongoose = require('mongoose');
const { createNotification } = require('../services/notificationService');

const getPeople = async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query = {
      _id: { $ne: req.user._id },
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

    const receiver = await User.findById(receiverId).select('_id role');
    if (!receiver || receiver.role !== 'user') {
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
      return res.status(409).json({ message: existingRequest.status === 'accepted'
        ? 'You are already connected with this user'
        : 'A roommate request is already pending between these users' });
    }

    const request = await RoommateRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
    });

    const io = req.app.get('io');
    await createNotification(
      receiverId,
      req.user._id,
      'request',
      'New Roommate Request',
      `${req.user.username} sent you a roommate request.`,
      request._id,
      io
    );

    return res.status(201).json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const handleRequest = async (req, res) => {
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
      return res.status(403).json({ message: 'Not authorized to handle this request' });
    }

    request.status = status;
    await request.save();

    const io = req.app.get('io');
    await createNotification(
      request.sender,
      req.user._id,
      'request',
      `Roommate Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
      `${req.user.username} ${status} your roommate request.`,
      request._id,
      io
    );

    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const received = await RoommateRequest.find({ receiver: req.user._id })
      .populate('sender', 'username email')
      .sort({ createdAt: -1 });

    const sent = await RoommateRequest.find({ sender: req.user._id })
      .populate('receiver', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ received, sent });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPeople,
  sendRequest,
  handleRequest,
  getRequests,
};