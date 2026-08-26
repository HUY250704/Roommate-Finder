const express = require('express');
const router = express.Router();
const {
  addFavoriteRoom,
  removeFavoriteRoom,
  addFavoriteRoommate,
  removeFavoriteRoommate,
  getFavorites,
} = require('../controllers/FavoriteController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Save rooms and roommates to favorites
 */

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Xem danh sách ph?ng tr? và roommate yêu thích
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tr? v? danh sách yêu thích thành công
 */
router.get('/', protect, getFavorites);

/**
 * @swagger
 * /api/favorites/rooms:
 *   post:
 *     summary: Lýu ph?ng tr? yêu thích m?i
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *             properties:
 *               roomId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thêm thành công
 */
router.post('/rooms', protect, addFavoriteRoom);

/**
 * @swagger
 * /api/favorites/rooms/{roomId}:
 *   delete:
 *     summary: B? lýu ph?ng tr? yêu thích
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roomId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/rooms/:roomId', protect, removeFavoriteRoom);

/**
 * @swagger
 * /api/favorites/roommates:
 *   post:
 *     summary: Lýu roommate yêu thích m?i
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roommateId
 *             properties:
 *               roommateId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thêm thành công
 */
router.post('/roommates', protect, addFavoriteRoommate);

/**
 * @swagger
 * /api/favorites/roommates/{roommateId}:
 *   delete:
 *     summary: B? lýu roommate yêu thích
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roommateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/roommates/:roommateId', protect, removeFavoriteRoommate);

module.exports = router;
