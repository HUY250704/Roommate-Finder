const express = require('express');
const router = express.Router();
const { addFavoriteRoom, removeFavoriteRoom, getFavorites } = require('../controllers/FavoriteController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Save rooms to favorites
 */

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Xem danh sách ph?ng tr? ð? lýu yêu thích
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
 *                 example: 60b9f07a2d480d19a4e4d586
 *     responses:
 *       200:
 *         description: Thêm thành công
 *       400:
 *         description: Ð? lýu ph?ng này trý?c ðó
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

module.exports = router;
