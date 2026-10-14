const Favorite = require('../models/Favorite');
const Room = require('../models/Room');
const { createNotification } = require('../services/notificationService');

const getFavorites = async (req, res) => {
  try {
    let fav = await Favorite.findOne({ user: req.user._id })
      .populate({
        path: 'rooms',
        populate: { path: 'owner', select: 'username email' }
      })
      .populate('roommates', 'username email');

    if (!fav) {
      fav = await Favorite.create({ user: req.user._id, rooms: [], roommates: [] });
    }
    return res.status(200).json(fav);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addFavoriteRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    let fav = await Favorite.findOne({ user: req.user._id });
    if (!fav) {
      fav = await Favorite.create({ user: req.user._id, rooms: [], roommates: [] });
    }

    if (fav.rooms.includes(roomId)) {
      return res.status(400).json({ message: 'Room already in favorites' });
    }

    fav.rooms.push(roomId);
    await fav.save();

    // Notify room owner
    try {
      const room = await Room.findById(roomId).select('owner title');
      if (room && room.owner && room.owner.toString() !== req.user._id.toString()) {
        const io = req.app.get('io');
        await createNotification(
          room.owner,
          req.user._id,
          'favorite',
          'Room Favorited',
          `${req.user.username} favorited your listing "${room.title || 'Room'}"`,
          room._id,
          io
        );
      }
    } catch (notifErr) {
      console.error('Failed to notify room owner of favorite:', notifErr.message);
    }

    return res.status(200).json(fav);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const removeFavoriteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    let fav = await Favorite.findOne({ user: req.user._id });
    if (!fav) {
      return res.status(404).json({ message: 'Favorites not found' });
    }

    fav.rooms = fav.rooms.filter(id => id.toString() !== roomId);
    await fav.save();

    return res.status(200).json(fav);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addFavoriteRoommate = async (req, res) => {
  try {
    const { roommateId } = req.body;
    if (!roommateId) {
      return res.status(400).json({ message: 'Roommate ID is required' });
    }

    let fav = await Favorite.findOne({ user: req.user._id });
    if (!fav) {
      fav = await Favorite.create({ user: req.user._id, rooms: [], roommates: [] });
    }

    if (fav.roommates.includes(roommateId)) {
      return res.status(400).json({ message: 'Roommate already in favorites' });
    }

    fav.roommates.push(roommateId);
    await fav.save();

    // Notify favorited user/roommate profile
    if (roommateId.toString() !== req.user._id.toString()) {
      try {
        const io = req.app.get('io');
        await createNotification(
          roommateId,
          req.user._id,
          'favorite',
          'Profile Liked',
          `${req.user.username} liked / favorited your roommate profile.`,
          null,
          io
        );
      } catch (notifErr) {
        console.error('Failed to notify roommate of favorite:', notifErr.message);
      }
    }

    return res.status(200).json(fav);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const removeFavoriteRoommate = async (req, res) => {
  try {
    const { roommateId } = req.params;
    let fav = await Favorite.findOne({ user: req.user._id });
    if (!fav) {
      return res.status(404).json({ message: 'Favorites not found' });
    }

    fav.roommates = fav.roommates.filter(id => id.toString() !== roommateId);
    await fav.save();

    return res.status(200).json(fav);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addFavoriteRoom,
  removeFavoriteRoom,
  addFavoriteRoommate,
  removeFavoriteRoommate,
  getFavorites,
};
