const mongoose = require('mongoose');

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', ReportSchema);
