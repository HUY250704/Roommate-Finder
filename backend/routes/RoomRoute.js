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
 *     summary: ��ng ph?ng m?i
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
 *                 example: Ph?ng tr? cao c?p trung t�m Qu?n 1
 *               description:
 *                 type: string
 *                 example: Ph?ng �?y �? ti?n nghi, gi? gi?c t? do, c� ch? �? xe r?ng r?i.
 *               price:
 *                 type: number
 *                 example: 3500000
 *               address:
 *                 type: string
 *                 example: 123 Nguy?n Tr?i, Ph�?ng B?n Th�nh, Qu?n 1
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
 *         description: ��ng ph?ng th�nh c�ng
 *       401:
 *         description: Ch�a x�c th?c ng�?i d�ng
 */
router.post('/', protect, createRoom);

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: L?y danh s�ch t?t c? ph?ng c?n tr?ng (available)
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Tr? v? danh s�ch ph?ng th�nh c�ng
 */
router.get('/', getRooms);

/**
 * @swagger
 * /api/rooms/search:
 *   get:
 *     summary: L?c ph?ng n�ng cao theo �?a �i?m, gi� c?, lo?i ph?ng v� l?i s?ng c?a ch? ph?ng
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
 *       - name: amenities
 *         in: query
 *         description: Tiện ích cần có; có thể lặp tham số hoặc phân cách bằng dấu phẩy
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: availableFrom
 *         in: query
 *         description: Ngày người tìm phòng muốn dọn vào; phòng phải sẵn sàng trước hoặc trong ngày này
 *         schema:
 *           type: string
 *           format: date
 *       - name: gender
 *         in: query
 *         schema:
 *           type: string
 *           enum: [male, female, other, any]
 *       - name: minAge
 *         in: query
 *         schema:
 *           type: integer
 *       - name: maxAge
 *         in: query
 *         schema:
 *           type: integer
 *       - name: lat
 *         in: query
 *         schema:
 *           type: number
 *       - name: lng
 *         in: query
 *         schema:
 *           type: number
 *       - name: radiusKm
 *         in: query
 *         description: Bán kính tìm kiếm tính bằng kilomet, cần đi kèm lat và lng
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Tr? v? k?t qu? t?m ki?m th�nh c�ng
 */
router.get('/search', searchRooms);

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: L?y chi ti?t th�ng tin m?t ph?ng theo ID
 *     tags: [Rooms]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tr? v? chi ti?t ph?ng th�nh c�ng
 *       404:
 *         description: Kh�ng t?m th?y ph?ng
 */
router.get('/:id', getRoomById);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: C?p nh?t th�ng tin ph?ng c?a b?n
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
 *         description: C?p nh?t ph?ng th�nh c�ng
 *       403:
 *         description: B?n kh�ng c� quy?n ch?nh s?a ph?ng n�y
 */
router.put('/:id', protect, updateRoom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: X�a ph?ng c?a b?n
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
 *         description: X�a ph?ng th�nh c�ng
 *       403:
 *         description: Kh�ng c� quy?n x�a ph?ng n�y
 */
router.delete('/:id', protect, deleteRoom);

/**
 * @swagger
 * /api/rooms/admin/{roomId}:
 *   delete:
 *     summary: Admin x�a ph?ng vi ph?m quy �?nh
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
 *         description: Admin x�a ph?ng th�nh c�ng
 *       403:
 *         description: Kh�ng c� quy?n Admin
 */
router.delete('/admin/:roomId', protect, manageRooms);

module.exports = router;
