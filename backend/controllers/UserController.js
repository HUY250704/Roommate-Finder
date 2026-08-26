const User = require('../models/User');
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

const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const Room = require('../models/Room');
    const Match = require('../models/Match');
    const Report = require('../models/Report');

    const totalUsers = await User.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalMatches = await Match.countDocuments();
    const totalReports = await Report.countDocuments();

    return res.status(200).json({
      users: totalUsers,
      rooms: totalRooms,
      matches: totalMatches,
      reports: totalReports,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const manageUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const { userId, action } = req.body;
    if (action === 'delete') {
      await User.findByIdAndDelete(userId);
      return res.status(200).json({ message: 'User deleted successfully' });
    } else if (action === 'make_admin') {
      const user = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });
      return res.status(200).json({ message: 'User promoted to admin', user });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
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
