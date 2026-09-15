const express = require('express');
const router = express.Router();
const { search, getAutocomplete, reverse, getRoute } = require('../controllers/MapController');

/**
 * @swagger
 * tags:
 *   name: Map
 *   description: Vietmap GIS services, address search, geocoding & routing
 */

/**
 * @swagger
 * /api/map/search:
 *   get:
 *     summary: Tìm kiếm địa chỉ hoặc vị trí địa lý với Vietmap
 *     tags: [Map]
 *     parameters:
 *       - in: query
 *         name: text
 *         required: true
 *         schema:
 *           type: string
 *         description: Tên địa chỉ, đường, phường, quận
 *       - in: query
 *         name: lat
 *         required: false
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Danh sách địa điểm kết quả
 */
router.get('/search', search);

/**
 * @swagger
 * /api/map/autocomplete:
 *   get:
 *     summary: Gợi ý địa chỉ tự động (Autocomplete)
 *     tags: [Map]
 *     parameters:
 *       - in: query
 *         name: text
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách gợi ý địa chỉ
 */
router.get('/autocomplete', getAutocomplete);

/**
 * @swagger
 * /api/map/reverse:
 *   get:
 *     summary: Chuyển đổi tọa độ (lat, lng) sang địa chỉ chi tiết
 *     tags: [Map]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Địa chỉ chi tiết
 */
router.get('/reverse', reverse);

/**
 * @swagger
 * /api/map/route:
 *   get:
 *     summary: Tính toán khoảng cách & tuyến đường giữa 2 điểm
 *     tags: [Map]
 *     parameters:
 *       - in: query
 *         name: origin
 *         required: true
 *         schema:
 *           type: string
 *         example: "16.0718,108.2205"
 *       - in: query
 *         name: destination
 *         required: true
 *         schema:
 *           type: string
 *         example: "16.0544,108.2022"
 *       - in: query
 *         name: vehicle
 *         required: false
 *         schema:
 *           type: string
 *           enum: [car, bike, motorcycle, foot]
 *     responses:
 *       200:
 *         description: Chi tiết tuyến đường và khoảng cách
 */
router.get('/route', getRoute);

module.exports = router;
