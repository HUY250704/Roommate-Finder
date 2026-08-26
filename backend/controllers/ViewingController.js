const Viewing = require('../models/Viewing');
const Room = require('../models/Room');
const { createNotification } = require('../services/notificationService');

const requestViewing = async (req, res) => {
  try {
    const { roomId, date, message } = req.body;
    if (!roomId || !date) {
      return res.status(400).json({ message: 'Room ID and date are required' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot request a viewing for your own room' });
    }

    const viewing = await Viewing.create({
      user: req.user._id,
      room: roomId,
      date,
      message,
    });

    await createNotification(
      room.owner,
      req.user._id,
      'viewing',
      'New Viewing Request',
      `${req.user.username} requested a viewing for your room: "${room.title}".`,
      viewing._id
    );

    return res.status(201).json(viewing);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const handleViewing = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const viewing = await Viewing.findById(req.params.id).populate('room');
    if (!viewing) {
      return res.status(404).json({ message: 'Viewing request not found' });
    }

    if (viewing.room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to handle this viewing request' });
    }

    viewing.status = status;
    await viewing.save();

    await createNotification(
      viewing.user,
      req.user._id,
      'viewing',
      `Viewing Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      `Your viewing request for "${viewing.room.title}" was ${status}.`,
      viewing._id
    );

    return res.status(200).json(viewing);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getViewings = async (req, res) => {
  try {
    const myRooms = await Room.find({ owner: req.user._id }).select('_id');
    const myRoomIds = myRooms.map(r => r._id);

    const viewings = await Viewing.find({
      $or: [
        { user: req.user._id },
        { room: { $in: myRoomIds } }
      ]
    })
      .populate('user', 'username email')
      .populate({
        path: 'room',
        populate: { path: 'owner', select: 'username email' }
      })
      .sort({ date: 1 });

    return res.status(200).json(viewings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestViewing,
  handleViewing,
  getViewings,
};
