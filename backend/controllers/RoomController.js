const Room = require('../models/Room');
const Profile = require('../models/Profile');
const Favorite = require('../models/Favorite');
const { createNotification } = require('../services/notificationService');

const ROOM_UPDATE_FIELDS = ['price', 'address', 'description', 'images', 'amenities', 'status', 'title', 'location', 'area', 'bedrooms', 'bathrooms', 'numRoommates', 'houseRules', 'availableFrom', 'roomType'];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const coordinatesFromInput = (input) => {
  if (input === undefined) return undefined;
  const coords = Array.isArray(input)
    ? input
    : input && Array.isArray(input.coordinates)
      ? input.coordinates
      : input && input.lat !== undefined && input.lng !== undefined
        ? [input.lng, input.lat]
        : null;
  if (
    !coords || coords.length !== 2 ||
    !Number.isFinite(Number(coords[0])) || !Number.isFinite(Number(coords[1])) ||
    Number(coords[0]) < -180 || Number(coords[0]) > 180 ||
    Number(coords[1]) < -90 || Number(coords[1]) > 90
  ) {
    return null;
  }
  return { type: 'Point', coordinates: [Number(coords[0]), Number(coords[1])] };
};

const queryNumber = (value, name, res) => {
  if (value === undefined || value === '') return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) {
    res.status(400).json({ message: `${name} must be a valid number` });
    return null;
  }
  return number;
};

const createRoom = async (req, res) => {
  try {
    const { title, description, price, address, location, area, bedrooms, bathrooms, numRoommates, houseRules, images, amenities, availableFrom, roomType } = req.body;
    const coordinates = coordinatesFromInput(
      req.body.coordinates === undefined && (req.body.lat !== undefined || req.body.lng !== undefined)
        ? { lat: req.body.lat, lng: req.body.lng }
        : req.body.coordinates
    );
    if (coordinates === null) {
      return res.status(400).json({ message: 'Valid room coordinates are required as [longitude, latitude]' });
    }
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
      ...(coordinates ? { coordinates } : {}),
    });

    // Notify users looking for rooms matching this location and budget
    try {
      const io = req.app.get('io');
      const targetProfiles = await Profile.find({
        user: { $ne: req.user._id },
        $or: [
          { 'searchPreferences.location': { $regex: escapeRegex(location || address || ''), $options: 'i' } },
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
    const rooms = await Room.find({ status: { $in: ['available', 'approved'] } }).populate('owner', 'username email');
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

    if (Object.prototype.hasOwnProperty.call(req.body, 'coordinates') ||
        Object.prototype.hasOwnProperty.call(req.body, 'lat') ||
        Object.prototype.hasOwnProperty.call(req.body, 'lng')) {
      const coordinates = coordinatesFromInput(
        req.body.coordinates === undefined
          ? { lat: req.body.lat, lng: req.body.lng }
          : req.body.coordinates
      );
      if (!coordinates) {
        return res.status(400).json({ message: 'Valid room coordinates are required as [longitude, latitude]' });
      }
      updates.coordinates = coordinates;
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
    const {
      location, minPrice, maxPrice, roomType, smoking, pets, sleepSchedule,
      cleanliness, amenities, availableFrom, moveInDate, gender,
      minAge, maxAge, ageMin, ageMax, lat, lng, radius, radiusKm, distance,
    } = req.query;

    const query = { status: { $in: ['available', 'approved'] } };

    if (location) {
      const safeLocation = escapeRegex(String(location));
      query.$or = [
        { location: { $regex: safeLocation, $options: 'i' } },
        { address: { $regex: safeLocation, $options: 'i' } },
      ];
    }

    const minimumPrice = queryNumber(minPrice, 'minPrice', res);
    if (minimumPrice === null) return;
    const maximumPrice = queryNumber(maxPrice, 'maxPrice', res);
    if (maximumPrice === null) return;
    if (minimumPrice !== undefined || maximumPrice !== undefined) {
      query.price = {};
      if (minimumPrice !== undefined) query.price.$gte = minimumPrice;
      if (maximumPrice !== undefined) query.price.$lte = maximumPrice;
    }

    if (roomType) {
      query.roomType = roomType;
    }

    const selectedAmenities = (Array.isArray(amenities) ? amenities : String(amenities || '').split(','))
      .map((amenity) => amenity.trim())
      .filter(Boolean);
    if (selectedAmenities.length) {
      query.amenities = { $all: selectedAmenities };
    }

    const requestedDate = availableFrom || moveInDate;
    if (requestedDate) {
      const moveIn = new Date(requestedDate);
      if (Number.isNaN(moveIn.getTime())) {
        return res.status(400).json({ message: 'availableFrom must be a valid date' });
      }
      query.availableFrom = { $lte: moveIn };
    }

    const minimumAge = queryNumber(minAge === undefined ? ageMin : minAge, 'minAge', res);
    if (minimumAge === null) return;
    const maximumAge = queryNumber(maxAge === undefined ? ageMax : maxAge, 'maxAge', res);
    if (maximumAge === null) return;
    if ((minimumAge !== undefined && minimumAge < 0) || (maximumAge !== undefined && maximumAge < 0) ||
        (minimumAge !== undefined && maximumAge !== undefined && minimumAge > maximumAge)) {
      return res.status(400).json({ message: 'Age range is invalid' });
    }

    const profileQuery = {};
    if (gender && gender !== 'any') profileQuery.gender = String(gender).toLowerCase();
    if (smoking) profileQuery['lifestyle.smoking'] = smoking;
    if (pets) profileQuery['lifestyle.pets'] = pets;
    if (sleepSchedule) profileQuery['lifestyle.sleepSchedule'] = sleepSchedule;
    if (cleanliness) profileQuery['lifestyle.cleanliness'] = cleanliness;

    if (minimumAge !== undefined || maximumAge !== undefined) {
      profileQuery.dateOfBirth = {};
      const today = new Date();
      if (minimumAge !== undefined) {
        const oldestAllowedBirthDate = new Date(today);
        oldestAllowedBirthDate.setFullYear(today.getFullYear() - minimumAge);
        profileQuery.dateOfBirth.$lte = oldestAllowedBirthDate;
      }
      if (maximumAge !== undefined) {
        const youngestAllowedBirthDate = new Date(today);
        youngestAllowedBirthDate.setFullYear(today.getFullYear() - maximumAge - 1);
        profileQuery.dateOfBirth.$gt = youngestAllowedBirthDate;
      }
    }

    if (Object.keys(profileQuery).length) {
      const matchingProfiles = await Profile.find(profileQuery).select('user');
      const matchingUserIds = matchingProfiles.map(p => p.user);
      query.owner = { $in: matchingUserIds };
    }

    const searchLat = queryNumber(lat, 'lat', res);
    if (searchLat === null) return;
    const searchLng = queryNumber(lng, 'lng', res);
    if (searchLng === null) return;
    const searchRadius = queryNumber(radiusKm || radius || distance, 'radiusKm', res);
    if (searchRadius === null) return;
    if (searchLat !== undefined || searchLng !== undefined || searchRadius !== undefined) {
      if (searchLat === undefined || searchLng === undefined || searchRadius === undefined ||
          searchLat < -90 || searchLat > 90 || searchLng < -180 || searchLng > 180 || searchRadius <= 0) {
        return res.status(400).json({ message: 'Valid lat, lng and positive radiusKm are required for distance search' });
      }
      query.coordinates = {
        $geoWithin: {
          $centerSphere: [[searchLng, searchLat], searchRadius / 6378.1],
        },
      };
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
