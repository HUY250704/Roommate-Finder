const Room = require('../models/Room');
const Profile = require('../models/Profile');

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

    room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
