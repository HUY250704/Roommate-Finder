const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple, deleteImage } = require('../controllers/UploadController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Cloudinary image upload and management
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload một hình ảnh lên Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 string, Data URL hoặc Image URL
 *               folder:
 *                 type: string
 *                 description: Thư mục lưu trữ trên Cloudinary (mặc định roommate-finder)
 *     responses:
 *       200:
 *         description: Upload thành công, trả về link ảnh secure_url
 *       400:
 *         description: Thiếu dữ liệu ảnh
 *       500:
 *         description: Lỗi máy chủ hoặc Cloudinary
 */
router.post('/', protect, uploadSingle);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload nhiều hình ảnh lên Cloudinary (cho gallery phòng trọ)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách base64 strings hoặc URL ảnh
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Upload thành công, trả về danh sách URLs
 */
router.post('/multiple', protect, uploadMultiple);

/**
 * @swagger
 * /api/upload/delete:
 *   post:
 *     summary: Xóa hình ảnh trên Cloudinary bằng publicId
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicId
 *             properties:
 *               publicId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa ảnh thành công
 */
router.post('/delete', protect, deleteImage);

module.exports = router;