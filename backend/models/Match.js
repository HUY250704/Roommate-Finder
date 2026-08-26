const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    details: {
      budgetScore: { type: Number, default: 0 },
      locationScore: { type: Number, default: 0 },
      lifestyleScore: { type: Number, default: 0 },
      habitsScore: { type: Number, default: 0 },
      interestsScore: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['pending', 'matched', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate match pairs (user1, user2 and user2, user1)
MatchSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model('Match', MatchSchema);
