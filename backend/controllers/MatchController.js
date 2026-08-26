const Match = require('../models/Match');
const Profile = require('../models/Profile');
const { calculateMatchScore } = require('../utils/matchCalculator');

const calculateMatch = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    const currentUserId = req.user._id;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'Cannot match with yourself' });
    }

    const myProfile = await Profile.findOne({ user: currentUserId });
    const targetProfile = await Profile.findOne({ user: targetUserId });

    if (!myProfile || !targetProfile) {
      return res.status(404).json({ message: 'One or both profiles not found. Please complete profile first.' });
    }

    const { matchScore, details } = calculateMatchScore(myProfile, targetProfile);

    const user1 = currentUserId < targetUserId ? currentUserId : targetUserId;
    const user2 = currentUserId < targetUserId ? targetUserId : currentUserId;

    const match = await Match.findOneAndUpdate(
      { user1, user2 },
      {
        user1,
        user2,
        matchScore,
        details,
        status: 'matched',
      },
      { upsert: true, new: true }
    );

    return res.status(200).json(match);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    })
      .populate('user1', 'username email')
      .populate('user2', 'username email')
      .sort({ matchScore: -1 });

    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  calculateMatch,
  getMatches,
};
