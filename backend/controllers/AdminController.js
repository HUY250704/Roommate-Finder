const User = require('../models/User');
const Room = require('../models/Room');
const Match = require('../models/Match');
const Report = require('../models/Report');
const RoommateRequest = require('../models/RoommateRequest');
const Profile = require('../models/Profile');
const Favorite = require('../models/Favorite');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { createNotification } = require('../services/notificationService');

const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      verifiedUsers,
      totalRooms,
      approvedRooms,
      pendingRooms,
      totalMatchesCalculated,
      acceptedRoommateRequests,
      acceptedMatches,
      totalReports,
      pendingReports,
      resolvedReports,
      avgRentResult,
      popularLocationsAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: { $ne: 'banned' }, isVerified: true }),
      User.countDocuments({ $or: [{ status: 'banned' }, { status: 'suspended' }, { isBanned: true }] }),
      User.countDocuments({ isVerified: true }),
      Room.countDocuments(),
      Room.countDocuments({ status: { $in: ['available', 'approved'] } }),
      Room.countDocuments({ status: 'pending' }),
      Match.countDocuments(),
      RoommateRequest.countDocuments({ status: 'accepted' }),
      Match.countDocuments({ status: 'matched' }),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'resolved' }),
      Room.aggregate([
        { $match: { price: { $gt: 0 } } },
        { $group: { _id: null, avgPrice: { $avg: '$price' } } },
      ]),
      Room.aggregate([
        { $match: { location: { $exists: true, $ne: '' } } },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const totalAcceptedPairs = acceptedRoommateRequests + acceptedMatches;
    const matchSuccessRate =
      totalMatchesCalculated > 0
        ? Number(((totalAcceptedPairs / totalMatchesCalculated) * 100).toFixed(1))
        : 0;

    const averageRent =
      avgRentResult.length > 0 && avgRentResult[0].avgPrice
        ? Math.round(avgRentResult[0].avgPrice)
        : 0;

    const popularLocations = popularLocationsAgg.map((loc) => ({
      name: loc._id,
      count: loc.count,
      percentage: totalRooms > 0 ? Number(((loc.count / totalRooms) * 100).toFixed(1)) : 0,
    }));

    return res.status(200).json({
      users: totalUsers,
      rooms: totalRooms,
      matches: totalMatchesCalculated,
      reports: totalReports,
      analytics: {
        totalUsers,
        activeUsers,
        bannedUsers,
        verifiedUsers,
        totalRooms,
        approvedRooms,
        pendingRooms,
        totalMatchesCalculated,
        matchesAccepted: totalAcceptedPairs,
        acceptedRoommateRequests,
        matchSuccessRate,
        totalReports,
        pendingReports,
        resolvedReports,
        averageRent,
        popularLocations,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  return getDashboardStats(req, res);
};

const getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const { status, role, isVerified, search } = req.query;
    const query = {};

    if (status) {
      if (status === 'banned') {
        query.$or = [{ status: 'banned' }, { status: 'suspended' }, { isBanned: true }];
      } else if (status === 'active') {
        query.status = 'active';
        query.isBanned = { $ne: true };
      } else {
        query.status = status;
      }
    }

    if (role) {
      query.role = role;
    }

    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const manageUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const userId = req.params.userId || req.body.userId;
    const { action, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (action === 'delete') {
      await Promise.all([
        User.findByIdAndDelete(userId),
        Profile.deleteOne({ user: userId }),
        Room.deleteMany({ owner: userId }),
        Favorite.deleteMany({ user: userId }),
        Match.deleteMany({ $or: [{ user1: userId }, { user2: userId }] }),
        RoommateRequest.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
        Notification.deleteMany({ user: userId }),
      ]);
      return res.status(200).json({ message: 'User and associated data deleted successfully' });
    }

    if (action === 'make_admin') {
      user.role = 'admin';
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({ message: 'User promoted to admin', user });
    }

    if (action === 'remove_admin') {
      user.role = 'user';
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({ message: 'Admin role removed', user });
    }

    if (action === 'ban') {
      user.status = 'banned';
      user.isBanned = true;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({ message: 'User banned successfully', user });
    }

    if (action === 'unban' || action === 'activate') {
      user.status = 'active';
      user.isBanned = false;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({ message: 'User unbanned/activated successfully', user });
    }

    if (action === 'suspend') {
      user.status = 'suspended';
      user.isBanned = true;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({ message: 'User suspended successfully', user });
    }

    if (action === 'verify') {
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({ message: 'User verified successfully', user });
    }

    if (action === 'unverify') {
      user.isVerified = false;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({ message: 'User verification revoked', user });
    }

    if (action === 'warn') {
      user.warnings = (user.warnings || 0) + 1;
      user.warningCount = (user.warningCount || 0) + 1;
      await user.save({ validateBeforeSave: false });

      try {
        const io = req.app.get('io');
        await createNotification(
          user._id,
          req.user._id,
          'system',
          'Official Warning',
          reason || 'You have received an official warning from the admin for policy violation.',
          null,
          io
        );
      } catch (notifErr) {
        console.error('Failed to notify warned user:', notifErr.message);
      }

      return res.status(200).json({ message: 'User warned successfully', warnings: user.warnings, user });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAdminRooms = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const rooms = await Room.find(query).populate('owner', 'username email status isVerified').sort({ createdAt: -1 });
    return res.status(200).json(rooms);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateRoomStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const roomId = req.params.roomId || req.params.id;
    const { status, action } = req.body;

    let nextStatus = status;
    if (action === 'approve') nextStatus = 'approved';
    if (action === 'reject') nextStatus = 'rejected';
    if (action === 'remove' || action === 'delete') nextStatus = 'removed';

    if (!nextStatus || !['pending', 'approved', 'available', 'rented', 'rejected', 'removed'].includes(nextStatus)) {
      return res.status(400).json({ message: 'Invalid room status or action' });
    }

    const room = await Room.findByIdAndUpdate(roomId, { status: nextStatus }, { new: true });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    try {
      const io = req.app.get('io');
      await createNotification(
        room.owner,
        req.user._id,
        'room',
        `Listing Status Update: ${nextStatus}`,
        `Your listing "${room.title}" status has been updated to "${nextStatus}".`,
        room._id,
        io
      );
    } catch (notifErr) {
      console.error('Failed to notify room owner on status change:', notifErr.message);
    }

    return res.status(200).json({ message: `Room status updated to ${nextStatus}`, room });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const approveRoom = async (req, res) => {
  req.body.status = 'approved';
  return updateRoomStatus(req, res);
};

const rejectRoom = async (req, res) => {
  req.body.status = 'rejected';
  return updateRoomStatus(req, res);
};

const manageRooms = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const roomId = req.params.roomId || req.params.id || req.body.roomId;
    const { action } = req.body || {};

    if (action === 'approve') {
      return approveRoom(req, res);
    }
    if (action === 'reject') {
      return rejectRoom(req, res);
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await Room.findByIdAndDelete(roomId);
    await Favorite.updateMany({}, { $pull: { rooms: roomId } });

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

    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('reporter', 'username email')
      .populate('reportedUser', 'username email status isBanned warnings')
      .populate('reportedRoom', 'title status location price')
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

    const reportId = req.params.id || req.params.reportId;
    const { status, action, adminNotes, notes, reason } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    let reportStatus = status || report.status;
    let actionTaken = action || '';

    if (action) {
      reportStatus = 'resolved';

      if (action === 'warn' && report.reportedUser) {
        const targetUser = await User.findById(report.reportedUser);
        if (targetUser) {
          targetUser.warnings = (targetUser.warnings || 0) + 1;
          targetUser.warningCount = (targetUser.warningCount || 0) + 1;
          await targetUser.save({ validateBeforeSave: false });

          try {
            const io = req.app.get('io');
            await createNotification(
              targetUser._id,
              req.user._id,
              'system',
              'Official Warning',
              reason || `You have received a formal warning regarding report #${report._id}.`,
              null,
              io
            );
          } catch (notifErr) {
            console.error('Failed to send warning notification:', notifErr.message);
          }
        }
      } else if (action === 'ban' && report.reportedUser) {
        await User.findByIdAndUpdate(report.reportedUser, {
          status: 'banned',
          isBanned: true,
        });
      } else if (action === 'unban' && report.reportedUser) {
        await User.findByIdAndUpdate(report.reportedUser, {
          status: 'active',
          isBanned: false,
        });
      } else if ((action === 'delete_room' || action === 'remove_room') && report.reportedRoom) {
        await Room.findByIdAndUpdate(report.reportedRoom, { status: 'removed' });
      } else if (action === 'approve_room' && report.reportedRoom) {
        await Room.findByIdAndUpdate(report.reportedRoom, { status: 'approved' });
      } else if (action === 'reject_room' && report.reportedRoom) {
        await Room.findByIdAndUpdate(report.reportedRoom, { status: 'rejected' });
      }
    }

    report.status = reportStatus;
    if (actionTaken) report.actionTaken = actionTaken;
    if (adminNotes || notes) report.adminNotes = adminNotes || notes;
    if (reportStatus === 'resolved') report.resolvedAt = new Date();

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('reporter', 'username email')
      .populate('reportedUser', 'username email status isBanned warnings')
      .populate('reportedRoom', 'title status location price');

    return res.status(200).json(updatedReport);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getUsers,
  manageUsers,
  getAdminRooms,
  updateRoomStatus,
  approveRoom,
  rejectRoom,
  manageRooms,
  handleReports,
  updateReportStatus,
};