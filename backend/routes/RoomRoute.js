const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  searchRooms,
  manageRooms,
} = require('../controllers/RoomController');
const { protect } = require('../middleware/auth');

router.get('/search', searchRooms);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/', protect, createRoom);
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);
router.delete('/admin/:roomId', protect, manageRooms);

module.exports = router;
