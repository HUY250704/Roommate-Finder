const calculateMatchScore = (p1, p2) => {
  let budgetScore = 0;
  let locationScore = 0;
  let lifestyleScore = 0;
  let habitsScore = 0;
  let interestsScore = 0;
  let otherScore = 0;

  // 1. Budget (Max: 20 points / 20%)
  const p1Min = p1.searchPreferences?.budgetMin || 0;
  const p1Max = p1.searchPreferences?.budgetMax || 100000000;
  const p2Min = p2.searchPreferences?.budgetMin || 0;
  const p2Max = p2.searchPreferences?.budgetMax || 100000000;

  const overlapMin = Math.max(p1Min, p2Min);
  const overlapMax = Math.min(p1Max, p2Max);

  if (overlapMax >= overlapMin) {
    budgetScore = 20;
  } else {
    const diff = overlapMin - overlapMax;
    const maxDiff = 5000000;
    budgetScore = Math.max(0, Math.round(20 * (1 - diff / maxDiff)));
  }

  // 2. Location (Max: 20 points / 20%) - Empty location gets 0 points
  const loc1 = (p1.searchPreferences?.location || '').trim().toLowerCase();
  const loc2 = (p2.searchPreferences?.location || '').trim().toLowerCase();
  if (loc1 && loc2) {
    if (loc1 === loc2) {
      locationScore = 20;
    } else if (loc1.includes(loc2) || loc2.includes(loc1)) {
      locationScore = 14;
    } else {
      locationScore = 0;
    }
  } else {
    locationScore = 0;
  }

  // 3. Lifestyle (Max: 25 points / 25% - Smoking: 13, Pets: 12)
  let smokingScore = 0;
  const s1 = p1.lifestyle?.smoking;
  const s2 = p2.lifestyle?.smoking;
  if (s1 && s2) {
    if (s1 === s2) {
      smokingScore = 13;
    } else if (s1 === 'no-preference' || s2 === 'no-preference') {
      smokingScore = 9;
    } else {
      smokingScore = 0;
    }
  }

  let petsScore = 0;
  const pet1 = p1.lifestyle?.pets;
  const pet2 = p2.lifestyle?.pets;
  if (pet1 && pet2) {
    if (pet1 === pet2) {
      petsScore = 12;
    } else if (pet1 === 'pet friendly' || pet2 === 'pet friendly') {
      petsScore = 8;
    } else {
      petsScore = 0;
    }
  }
  lifestyleScore = smokingScore + petsScore;

  // 4. House habits (Max: 20 points / 20% - Cleanliness: 10, Sleep Schedule: 10)
  let cleanScore = 0;
  const clean1 = p1.lifestyle?.cleanliness || 'medium';
  const clean2 = p2.lifestyle?.cleanliness || 'medium';
  if (clean1 === clean2) {
    cleanScore = 10;
  } else if ((clean1 === 'high' && clean2 === 'medium') || (clean1 === 'medium' && clean2 === 'high')) {
    cleanScore = 6;
  } else if ((clean1 === 'low' && clean2 === 'medium') || (clean1 === 'medium' && clean2 === 'low')) {
    cleanScore = 6;
  } else {
    cleanScore = 2;
  }

  let sleepScore = 0;
  const sleep1 = p1.lifestyle?.sleepSchedule;
  const sleep2 = p2.lifestyle?.sleepSchedule;
  if (sleep1 && sleep2) {
    if (sleep1 === sleep2) {
      sleepScore = 10;
    } else if (sleep1 === 'flexible' || sleep2 === 'flexible') {
      sleepScore = 7;
    } else {
      sleepScore = 0;
    }
  }
  habitsScore = cleanScore + sleepScore;

  // 5. Interests (Max: 10 points / 10%)
  const h1 = p1.lifestyle?.hobbies || [];
  const h2 = p2.lifestyle?.hobbies || [];
  const common = h1.filter(h => h2.includes(h));
  if (h1.length > 0 && h2.length > 0) {
    interestsScore = Math.min(10, common.length * 5);
  }

  // 6. Other (Max: 5 points / 5% - Gender preference compatibility)
  const prefGender1 = (p1.searchPreferences?.preferredGender || 'any').toLowerCase();
  const prefGender2 = (p2.searchPreferences?.preferredGender || 'any').toLowerCase();
  const g1 = (p1.gender || '').toLowerCase();
  const g2 = (p2.gender || '').toLowerCase();
  const matchGender1 = prefGender1 === 'any' || !g2 || prefGender1 === g2;
  const matchGender2 = prefGender2 === 'any' || !g1 || prefGender2 === g1;
  if (matchGender1 && matchGender2) {
    otherScore = 5;
  } else {
    otherScore = 0;
  }

  const matchScore = Math.min(100, Math.round(budgetScore + locationScore + lifestyleScore + habitsScore + interestsScore + otherScore));

  return {
    matchScore,
    details: {
      budgetScore,
      locationScore,
      lifestyleScore,
      habitsScore,
      interestsScore,
      otherScore,
    }
  };
};

module.exports = { calculateMatchScore };
