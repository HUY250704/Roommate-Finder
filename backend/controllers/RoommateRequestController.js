const RoommateRequest = require('../models/RoommateRequest');
const Notification = require('../models/Notification');

const sendRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    if (req.user._id.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const existingRequest = await RoommateRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending request already exists' });
    }

    const request = await RoommateRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
    });

    await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: 'request',
      title: 'New Roommate Request',
      content: `${req.user.username} sent you a roommate request.`,
      relatedId: request._id,
    });

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

    await Notification.create({
      recipient: request.sender,
      sender: req.user._id,
      type: 'request',
      title: `Roommate Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
      content: `${req.user.username} ${status} your roommate request.`,
      relatedId: request._id,
    });

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
  sendRequest,
  handleRequest,
  getRequests,
};
