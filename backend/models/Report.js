const mongoose = require('mongoose');

const REPORT_REASONS = [
  'Scam',
  'Fake listing',
  'Harassment',
  'Inappropriate content',
  'Other',
];

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for report'],
      enum: {
        values: REPORT_REASONS,
        message: 'Reason must be one of: Scam, Fake listing, Harassment, Inappropriate content, Other',
      },
    },
    details: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },
    actionTaken: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', ReportSchema);
module.exports.REPORT_REASONS = REPORT_REASONS;