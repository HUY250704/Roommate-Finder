const Match = require('../models/Match');
const Profile = require('../models/Profile');

const calculateMatchScore = (p1, p2) => {
  let budgetScore = 0;
  let lifestyleScore = 0;
  let habitsScore = 0;
  let locationScore = 0;
  let interestsScore = 0;

  const p1Min = p1.searchPreferences?.budgetMin || 0;
  const p1Max = p1.searchPreferences?.budgetMax || 10000000;
  const p2Min = p2.searchPreferences?.budgetMin || 0;
  const p2Max = p2.searchPreferences?.budgetMax || 10000000;

  const overlapMin = Math.max(p1Min, p2Min);
  const overlapMax = Math.min(p1Max, p2Max);

  if (overlapMax >= overlapMin) {
    budgetScore = 20;
  } else {
    const diff = overlapMin - overlapMax;
    const maxDiff = 5000000;
    budgetScore = Math.max(0, Math.round(20 * (1 - diff / maxDiff)));
  }

  if (p1.lifestyle?.smoking === p2.lifestyle?.smoking) {
    lifestyleScore += 15;
  } else if (p1.lifestyle?.smoking === 'no-preference' || p2.lifestyle?.smoking === 'no-preference') {
    lifestyleScore += 10;
  }

  if (p1.lifestyle?.pets === p2.lifestyle?.pets) {
    lifestyleScore += 15;
  } else if (p1.lifestyle?.pets === 'pet friendly' || p2.lifestyle?.pets === 'pet friendly') {
    lifestyleScore += 10;
  }

  if (p1.lifestyle?.sleepSchedule === p2.lifestyle?.sleepSchedule) {
    habitsScore += 15;
  } else if (p1.lifestyle?.sleepSchedule === 'flexible' || p2.lifestyle?.sleepSchedule === 'flexible') {
    habitsScore += 10;
  }

  if (p1.lifestyle?.cleanliness === p2.lifestyle?.cleanliness) {
    habitsScore += 20;
  } else {
    const clean1 = p1.lifestyle?.cleanliness || 'medium';
    const clean2 = p2.lifestyle?.cleanliness || 'medium';
    if ((clean1 === 'high' && clean2 === 'medium') || (clean1 === 'medium' && clean2 === 'high')) {
      habitsScore += 12;
    } else if ((clean1 === 'low' && clean2 === 'medium') || (clean1 === 'medium' && clean2 === 'low')) {
      habitsScore += 12;
    } else {
      habitsScore += 5;
    }
  }

  const loc1 = p1.searchPreferences?.location || '';
  const loc2 = p2.searchPreferences?.location || '';
  if (loc1 && loc2 && loc1.toLowerCase() === loc2.toLowerCase()) {
    locationScore = 15;
  } else if (loc1 && loc2 && (loc1.toLowerCase().includes(loc2.toLowerCase()) || loc2.toLowerCase().includes(loc1.toLowerCase()))) {
    locationScore = 10;
  } else {
    locationScore = 5;
  }

  const h1 = p1.lifestyle?.hobbies || [];
  const h2 = p2.lifestyle?.hobbies || [];
  const common = h1.filter(h => h2.includes(h));
  if (h1.length > 0 && h2.length > 0) {
    interestsScore = Math.min(10, common.length * 5);
  }

  const matchScore = budgetScore + lifestyleScore + habitsScore + locationScore + interestsScore;

  return {
    matchScore: Math.min(100, matchScore),
    details: {
      budgetScore,
      locationScore,
      lifestyleScore,
      habitsScore,
      interestsScore,
    }
  };
};

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
