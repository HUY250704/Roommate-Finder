const Report = require('../models/Report');
const User = require('../models/User');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const { REPORT_REASONS } = require('../models/Report');

const normalizeReason = (reason) => {
  if (!reason || typeof reason !== 'string') return null;
  const trimmed = reason.trim();
  const match = REPORT_REASONS.find(
    (r) => r.toLowerCase() === trimmed.toLowerCase()
  );
  return match || null;
};

const createReport = async (req, res) => {
  try {
    const { reportedUserId, reportedRoomId, reason, details } = req.body;

    const hasUser = !!reportedUserId;
    const hasRoom = !!reportedRoomId;

    if ((!hasUser && !hasRoom) || (hasUser && hasRoom)) {
      return res.status(400).json({
        message: 'Report must specify exactly one target: either a reported user or a reported room listing',
      });
    }

    const matchedReason = normalizeReason(reason);
    if (!matchedReason) {
      return res.status(400).json({
        message: `Invalid reason. Must be one of: ${REPORT_REASONS.join(', ')}`,
      });
    }

    if (hasUser) {
      if (!mongoose.Types.ObjectId.isValid(reportedUserId)) {
        return res.status(400).json({ message: 'Invalid reported user ID' });
      }
      if (req.user._id.toString() === reportedUserId.toString()) {
        return res.status(400).json({ message: 'Cannot report yourself' });
      }
      const targetUser = await User.findById(reportedUserId);
      if (!targetUser) {
        return res.status(404).json({ message: 'Reported user not found' });
      }
    }

    if (hasRoom) {
      if (!mongoose.Types.ObjectId.isValid(reportedRoomId)) {
        return res.status(400).json({ message: 'Invalid reported room ID' });
      }
      const targetRoom = await Room.findById(reportedRoomId);
      if (!targetRoom) {
        return res.status(404).json({ message: 'Reported room not found' });
      }
      if (targetRoom.owner.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot report your own room listing' });
      }
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: hasUser ? reportedUserId : undefined,
      reportedRoom: hasRoom ? reportedRoomId : undefined,
      reason: matchedReason,
      details: details || '',
    });

    const populated = await Report.findById(report._id)
      .populate('reporter', 'username email')
      .populate('reportedUser', 'username email')
      .populate('reportedRoom', 'title location price');

    return res.status(201).json(populated);
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
    if (status) query.status = status;

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

    const { status, action, notes, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (status) report.status = status;
    if (action) {
      report.actionTaken = action;
      report.status = 'resolved';
      report.resolvedAt = new Date();
    }
    if (notes || adminNotes) report.adminNotes = notes || adminNotes;

    await report.save();

    const populated = await Report.findById(report._id)
      .populate('reporter', 'username email')
      .populate('reportedUser', 'username email')
      .populate('reportedRoom', 'title');

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  handleReports,
  updateReportStatus,
};