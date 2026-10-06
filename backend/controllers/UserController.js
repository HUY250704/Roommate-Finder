const User = require('../models/User');
const Profile = require('../models/Profile');
const { getDashboardStats, manageUsers } = require('./AdminController');

const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate('user', 'username email role isVerified status warnings');
    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
      profile = await Profile.findOne({ user: req.user._id }).populate('user', 'username email role isVerified status warnings');
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

module.exports = {
  getProfile,
  updateProfile,
  getDashboardStats,
  manageUsers,
};