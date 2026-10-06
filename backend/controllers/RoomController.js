const Room = require('../models/Room');
const Profile = require('../models/Profile');
const Favorite = require('../models/Favorite');
const { createNotification } = require('../services/notificationService');

const ROOM_UPDATE_FIELDS = ['price', 'address', 'description', 'images', 'amenities', 'status'];

const createRoom = async (req, res) => {
  try {
    const { title, description, price, address, location, area, bedrooms, bathrooms, numRoommates, houseRules, images, amenities, availableFrom, roomType } = req.body;
    const room = await Room.create({
      owner: req.user._id,
      title,
      description,
      price,
      address,
      location,
      area,
      bedrooms,
      bathrooms,
      numRoommates,
      houseRules,
      images,
      amenities,
      availableFrom,
      roomType,
    });

    // Notify users looking for rooms matching this location and budget
    try {
      const io = req.app.get('io');
      const targetProfiles = await Profile.find({
        user: { $ne: req.user._id },
        $or: [
          { 'searchPreferences.location': { $regex: location || address || '', $options: 'i' } },
          { 'searchPreferences.budgetMax': { $gte: Number(price) } },
        ],
      }).select('user').limit(20);

      for (const p of targetProfiles) {
        if (p.user) {
          await createNotification(
            p.user,
            req.user._id,
            'room',
            'New Matching Room Listing',
            `A new room matching your preferences has been posted: "${title || 'Room listing'}"`,
            room._id,
            io
          );
        }
      }
    } catch (notifErr) {
      console.error('Failed to send new room notifications:', notifErr.message);
    }

    return res.status(201).json(room);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'available' }).populate('owner', 'username email');
    return res.status(200).json(rooms);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('owner', 'username email');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to update this room' });
    }

    const updates = {};
    for (const field of ROOM_UPDATE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid room fields provided for update' });
    }

    room = await Room.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    // Notify users who favorited this room about the update
    try {
      const io = req.app.get('io');
      const favoritesWithRoom = await Favorite.find({ rooms: room._id }).select('user');
      for (const fav of favoritesWithRoom) {
        if (fav.user && fav.user.toString() !== req.user._id.toString()) {
          await createNotification(
            fav.user,
            req.user._id,
            'room',
            'Listing Updated',
            `A room you favorited ("${room.title || 'Room'}") has been updated.`,
            room._id,
            io
          );
        }
      }
    } catch (notifErr) {
      console.error('Failed to notify favorited users on room update:', notifErr.message);
    }

    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to delete this room' });
    }

    await Room.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Room removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const searchRooms = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, roomType, smoking, pets, sleepSchedule, cleanliness } = req.query;

    const query = { status: 'available' };

    if (location) {
      query.$or = [
        { location: { $regex: location, $options: 'i' } },
        { address: { $regex: location, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (roomType) {
      query.roomType = roomType;
    }

    if (smoking || pets || sleepSchedule || cleanliness) {
      const profileQuery = {};
      if (smoking) profileQuery['lifestyle.smoking'] = smoking;
      if (pets) profileQuery['lifestyle.pets'] = pets;
      if (sleepSchedule) profileQuery['lifestyle.sleepSchedule'] = sleepSchedule;
      if (cleanliness) profileQuery['lifestyle.cleanliness'] = cleanliness;

      const matchingProfiles = await Profile.find(profileQuery).select('user');
      const matchingUserIds = matchingProfiles.map(p => p.user);
      query.owner = { $in: matchingUserIds };
    }

    const rooms = await Room.find(query).populate('owner', 'username email');
    return res.status(200).json(rooms);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const manageRooms = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const { roomId } = req.params;
    await Room.findByIdAndDelete(roomId);
    return res.status(200).json({ message: 'Room deleted successfully by admin' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  searchRooms,
  manageRooms,
};
