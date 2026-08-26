const express = require('express');
const router = express.Router();
const { addFavoriteRoom, removeFavoriteRoom, getFavorites } = require('../controllers/FavoriteController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFavorites);
router.post('/rooms', protect, addFavoriteRoom);
router.delete('/rooms/:roomId', protect, removeFavoriteRoom);

module.exports = router;
