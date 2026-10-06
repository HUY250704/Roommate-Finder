const User = require('../models/User');
const Profile = require('../models/Profile');
const { getDashboardStats, manageUsers } = require('./AdminController');
const { updateProfile } = require('./ProfileController');

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

module.exports = {
  getProfile,
  updateProfile,
  getDashboardStats,
  manageUsers,
};