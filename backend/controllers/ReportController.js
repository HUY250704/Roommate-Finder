const Report = require('../models/Report');

const createReport = async (req, res) => {
  try {
    const { reportedUserId, reportedRoomId, reason, details } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Reason for report is required' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUserId || undefined,
      reportedRoom: reportedRoomId || undefined,
      reason,
      details,
    });

    return res.status(201).json(report);
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
  createReport,
  handleReports,
  updateReportStatus,
};
