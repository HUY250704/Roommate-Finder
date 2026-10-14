const Block = require('../models/Block');
const User = require('../models/User');
const mongoose = require('mongoose');

const getBlockedUserIds = async (userId) => {
  if (!userId) return [];
  const blocks = await Block.find({
    $or: [{ blocker: userId }, { blocked: userId }],
  }).select('blocker blocked');

  const blockedSet = new Set();
  for (const b of blocks) {
    if (b.blocker.toString() === userId.toString()) {
      blockedSet.add(b.blocked.toString());
    } else {
      blockedSet.add(b.blocker.toString());
    }
  }
  return Array.from(blockedSet);
};

const isBlockedBetween = async (userId1, userId2) => {
  if (!userId1 || !userId2) return false;
  const exists = await Block.findOne({
    $or: [
      { blocker: userId1, blocked: userId2 },
      { blocker: userId2, blocked: userId1 },
    ],
  });
  return !!exists;
};

const blockUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.body.blockedUserId || req.body.userId;
    const { reason } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: 'User ID to block is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (req.user._id.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingBlock = await Block.findOne({
      blocker: req.user._id,
      blocked: targetUserId,
    });

    if (existingBlock) {
      return res.status(200).json({ message: 'User is already blocked', block: existingBlock });
    }

    const block = await Block.create({
      blocker: req.user._id,
      blocked: targetUserId,
      reason: reason || '',
    });

    return res.status(201).json({ message: 'User blocked successfully', block });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.body.blockedUserId || req.body.userId;

    if (!targetUserId) {
      return res.status(400).json({ message: 'User ID to unblock is required' });
    }

    const deleted = await Block.findOneAndDelete({
      blocker: req.user._id,
      blocked: targetUserId,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Block record not found' });
    }

    return res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const blocks = await Block.find({ blocker: req.user._id })
      .populate('blocked', 'username email avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json(blocks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  blockUser,
  unblockUser,
  getBlockedUsers,
  getBlockedUserIds,
  isBlockedBetween,
};