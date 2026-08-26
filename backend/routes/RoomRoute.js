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

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management and search
 */

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Ðãng ph?ng m?i
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - address
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 example: Ph?ng tr? cao c?p trung tâm Qu?n 1
 *               description:
 *                 type: string
 *                 example: Ph?ng ð?y ð? ti?n nghi, gi? gi?c t? do, có ch? ð? xe r?ng r?i.
 *               price:
 *                 type: number
 *                 example: 3500000
 *               address:
 *                 type: string
 *                 example: 123 Nguy?n Tr?i, Phý?ng B?n Thành, Qu?n 1
 *               location:
 *                 type: string
 *                 example: Qu?n 1
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: Wifi
 *               roomType:
 *                 type: string
 *                 enum: [Shared, Private, Entire House, Apartment]
 *                 example: Private
 *     responses:
 *       201:
 *         description: Ðãng ph?ng thành công
 *       401:
 *         description: Chýa xác th?c ngý?i dùng
 */
router.post('/', protect, createRoom);

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: L?y danh sách t?t c? ph?ng c?n tr?ng (available)
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Tr? v? danh sách ph?ng thành công
 */
router.get('/', getRooms);

/**
 * @swagger
 * /api/rooms/search:
 *   get:
 *     summary: L?c ph?ng nâng cao theo ð?a ði?m, giá c?, lo?i ph?ng và l?i s?ng c?a ch? ph?ng
 *     tags: [Rooms]
 *     parameters:
 *       - name: location
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: minPrice
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *       - name: maxPrice
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *       - name: roomType
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Shared, Private, Entire House, Apartment]
 *       - name: smoking
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [non-smoker, smoker, occasional, no-preference]
 *       - name: pets
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["no pets", "has pets", "pet friendly"]
 *       - name: sleepSchedule
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [early bird, night owl, flexible]
 *       - name: cleanliness
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *     responses:
 *       200:
 *         description: Tr? v? k?t qu? t?m ki?m thành công
 */
router.get('/search', searchRooms);

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: L?y chi ti?t thông tin m?t ph?ng theo ID
 *     tags: [Rooms]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tr? v? chi ti?t ph?ng thành công
 *       404:
 *         description: Không t?m th?y ph?ng
 */
router.get('/:id', getRoomById);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: C?p nh?t thông tin ph?ng c?a b?n
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, rented, pending]
 *     responses:
 *       200:
 *         description: C?p nh?t ph?ng thành công
 *       403:
 *         description: B?n không có quy?n ch?nh s?a ph?ng này
 */
router.put('/:id', protect, updateRoom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Xóa ph?ng c?a b?n
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa ph?ng thành công
 *       403:
 *         description: Không có quy?n xóa ph?ng này
 */
router.delete('/:id', protect, deleteRoom);

/**
 * @swagger
 * /api/rooms/admin/{roomId}:
 *   delete:
 *     summary: Admin xóa ph?ng vi ph?m quy ð?nh
 *     tags: [Rooms]
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
 *         description: Admin xóa ph?ng thành công
 *       403:
 *         description: Không có quy?n Admin
 */
router.delete('/admin/:roomId', protect, manageRooms);

module.exports = router;
