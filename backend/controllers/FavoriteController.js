const Favorite = require('../models/Favorite');

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

module.exports = {
  addFavoriteRoom,
  removeFavoriteRoom,
  getFavorites,
};
