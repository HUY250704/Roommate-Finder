const Profile = require('../models/Profile');
const { getBlockedUserIds, isBlockedBetween } = require('./BlockController');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate('user', 'username email role isVerified status');
    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
      profile = await Profile.findOne({ user: req.user._id }).populate('user', 'username email role isVerified status');
    }
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, gender, dateOfBirth, avatar, bio, lifestyle, searchPreferences } = req.body;
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
    }

    if (fullName !== undefined) profile.fullName = fullName;
    if (phoneNumber !== undefined) profile.phoneNumber = phoneNumber;
    if (gender !== undefined) profile.gender = gender;
    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (avatar !== undefined) profile.avatar = avatar;
    if (bio !== undefined) profile.bio = bio;
    if (lifestyle !== undefined) profile.lifestyle = { ...profile.lifestyle.toObject(), ...lifestyle };
    if (searchPreferences !== undefined) profile.searchPreferences = { ...profile.searchPreferences.toObject(), ...searchPreferences };

    await profile.save();
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRoommates = async (req, res) => {
  try {
    const { gender, location, minBudget, maxBudget, smoking, pets, sleepSchedule, cleanliness } = req.query;

    const query = {};
    const excludedUserIds = [];

    if (req.user) {
      excludedUserIds.push(req.user._id);
      const blockedIds = await getBlockedUserIds(req.user._id);
      excludedUserIds.push(...blockedIds);
    }

    query.user = { $nin: excludedUserIds };

    if (gender) query.gender = gender;
    if (location) query['searchPreferences.location'] = { $regex: escapeRegex(String(location)), $options: 'i' };

    if (minBudget || maxBudget) {
      if (maxBudget) query['searchPreferences.budgetMin'] = { $lte: Number(maxBudget) };
      if (minBudget) query['searchPreferences.budgetMax'] = { $gte: Number(minBudget) };
    }

    if (smoking) query['lifestyle.smoking'] = smoking;
    if (pets) query['lifestyle.pets'] = pets;
    if (sleepSchedule) query['lifestyle.sleepSchedule'] = sleepSchedule;
    if (cleanliness) query['lifestyle.cleanliness'] = cleanliness;

    const roommates = await Profile.find(query).populate('user', 'username email role isVerified status');
    return res.status(200).json(roommates);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRoommateById = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (req.user && targetUserId) {
      const blocked = await isBlockedBetween(req.user._id, targetUserId);
      if (blocked) {
        return res.status(403).json({ message: 'Access denied: User is blocked' });
      }
    }

    const roommate = await Profile.findOne({ user: targetUserId }).populate('user', 'username email role isVerified status');
    if (!roommate) {
      return res.status(404).json({ message: 'Roommate profile not found' });
    }
    return res.status(200).json(roommate);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getRoommates,
  getRoommateById,
};