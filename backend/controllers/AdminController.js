const User = require('../models/User');
const Room = require('../models/Room');
const Match = require('../models/Match');
const Report = require('../models/Report');

const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

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

const handleReports = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const reports = await Report.find()
      .populate('reporter', 'username email')
      .populate('reportedUser', 'username email')
      .populate('reportedRoom', 'title')
      .sort({ createdAt: -1 });

    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    return res.status(200).json(report);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  manageUsers,
  manageRooms,
  handleReports,
  updateReportStatus,
};
