const Profile = require('../models/Profile');

const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate('user', 'username email role');
    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
      profile = await Profile.findOne({ user: req.user._id }).populate('user', 'username email role');
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
    if (req.user) {
      query.user = { $ne: req.user._id };
    }

    if (gender) query.gender = gender;
    if (location) query['searchPreferences.location'] = { $regex: location, $options: 'i' };

    if (minBudget || maxBudget) {
      query['searchPreferences.budgetMin'] = {};
      query['searchPreferences.budgetMax'] = {};
      if (minBudget) query['searchPreferences.budgetMin'].$gte = Number(minBudget);
      if (maxBudget) query['searchPreferences.budgetMax'].$lte = Number(maxBudget);
    }

    if (smoking) query['lifestyle.smoking'] = smoking;
    if (pets) query['lifestyle.pets'] = pets;
    if (sleepSchedule) query['lifestyle.sleepSchedule'] = sleepSchedule;
    if (cleanliness) query['lifestyle.cleanliness'] = cleanliness;

    const roommates = await Profile.find(query).populate('user', 'username email role');
    return res.status(200).json(roommates);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRoommateById = async (req, res) => {
  try {
    const roommate = await Profile.findOne({ user: req.params.id }).populate('user', 'username email role');
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
