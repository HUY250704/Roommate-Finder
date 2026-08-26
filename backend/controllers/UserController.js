const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforroommatefinder', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ username, email, password });
    if (user) {
      return res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully' });
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
  registerUser,
  loginUser,
  logoutUser,
  getDashboardStats,
  manageUsers,
};
