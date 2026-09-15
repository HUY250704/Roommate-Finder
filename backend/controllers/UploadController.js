const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

/**
 * Upload single image (avatar, room thumbnail)
 */
const uploadSingle = async (req, res) => {
  try {
    const { image, folder } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Vui lòng cung cấp dữ liệu hình ảnh (base64 hoặc URL)' });
    }

    const uploadResult = await uploadToCloudinary(image, folder || 'roommate-finder');

    return res.status(200).json({
      message: 'Upload hình ảnh thành công',
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      data: uploadResult,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Lỗi khi upload hình ảnh lên Cloudinary',
    });
  }
};

/**
 * Upload multiple images (for room galleries)
 */
const uploadMultiple = async (req, res) => {
  try {
    const { images, folder } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mảng hình ảnh images[]' });
    }

    const uploadPromises = images.map((img) => uploadToCloudinary(img, folder || 'roommate-finder/rooms'));
    const results = await Promise.all(uploadPromises);

    return res.status(200).json({
      message: 'Upload nhiều hình ảnh thành công',
      urls: results.map((r) => r.secure_url),
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Lỗi khi upload nhiều hình ảnh lên Cloudinary',
    });
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp publicId của ảnh cần xóa' });
    }

    const result = await deleteFromCloudinary(publicId);

    return res.status(200).json({
      message: 'Xóa ảnh thành công',
      result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Lỗi khi xóa ảnh trên Cloudinary',
    });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteImage,
};