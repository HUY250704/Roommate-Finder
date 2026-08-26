const express = require('express');
const router = express.Router();
const { calculateMatch, getMatches } = require('../controllers/MatchController');
const { protect } = require('../middleware/auth');

router.post('/calculate', protect, calculateMatch);
router.get('/', protect, getMatches);

module.exports = router;
