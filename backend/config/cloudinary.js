const crypto = require('crypto');

const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

/**
 * Generate SHA1 signature for authenticated Cloudinary uploads
 */
const generateSignature = (paramsToSign, apiSecret) => {
  const sortedKeys = Object.keys(paramsToSign).sort();
  const serialized = sortedKeys.map((key) => `${key}=${paramsToSign[key]}`).join('&');
  return crypto.createHash('sha1').update(serialized + apiSecret).digest('hex');
};

module.exports = {
  cloudinaryConfig,
  generateSignature,
};
