const https = require('https');
const { cloudinaryConfig, generateSignature } = require('../config/cloudinary');

/**
 * Upload an image (base64 string, data URI, or remote URL) to Cloudinary
 * @param {string} fileData - Base64 string, data URL or remote image URL
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<{url: string, secure_url: string, public_id: string}>}
 */
const uploadToCloudinary = async (fileData, folder = 'roommate-finder') => {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured in environment variables.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = generateSignature(paramsToSign, apiSecret);

  const payload = JSON.stringify({
    file: fileData,
    folder,
    timestamp,
    api_key: apiKey,
    signature,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${cloudName}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              url: parsed.url,
              secure_url: parsed.secure_url,
              public_id: parsed.public_id,
              format: parsed.format,
              width: parsed.width,
              height: parsed.height,
            });
          } else {
            reject(new Error(parsed.error?.message || 'Cloudinary upload failed'));
          }
        } catch (err) {
          reject(new Error(`Failed to parse Cloudinary response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Cloudinary network request failed: ${err.message}`));
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Delete an image by its public_id from Cloudinary
 * @param {string} publicId - Cloudinary image public_id
 */
const deleteFromCloudinary = async (publicId) => {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    public_id: publicId,
    timestamp,
  };

  const signature = generateSignature(paramsToSign, apiSecret);

  const payload = JSON.stringify({
    public_id: publicId,
    timestamp,
    api_key: apiKey,
    signature,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${cloudName}/image/destroy`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
