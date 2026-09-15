/**
 * Helper to upload image file or base64 to Cloudinary via backend API or direct upload
 * @param {File|Blob|string} image - File instance, Blob or base64 string
 * @param {string} token - User JWT token (optional)
 * @returns {Promise<{url: string, publicId?: string}>}
 */
export const uploadImageToCloudinary = async (image, token = '') => {
  // If it's a File or Blob, convert to base64
  let imageBase64 = image;
  if (image instanceof File || image instanceof Blob) {
    imageBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(image);
    });
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = Bearer ;
  }

  const response = await fetch(${apiUrl}/upload, {
    method: 'POST',
    headers,
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Upload to Cloudinary failed');
  }

  const data = await response.json();
  return {
    url: data.url,
    publicId: data.publicId,
    data: data.data,
  };
};