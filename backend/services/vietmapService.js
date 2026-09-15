const https = require('https');
const { vietmapConfig } = require('../config/vietmap');

/**
 * Generic helper to make GET requests to Vietmap API
 */
const fetchVietmap = (endpoint, params = {}) => {
  const apiKey = vietmapConfig.apiKey;
  if (!apiKey) {
    throw new Error('VIETMAP_API_KEY is not configured in environment variables.');
  }

  const query = new URLSearchParams({ apikey: apiKey, ...params }).toString();
  const url = `${vietmapConfig.baseUrl}/${endpoint}?${query}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || parsed.description || 'Vietmap API request failed'));
          }
        } catch (err) {
          reject(new Error(`Failed to parse Vietmap response: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Vietmap network error: ${err.message}`));
    });
  });
};

/**
 * Search place or geocode address to coordinates
 */
const searchAddress = async (text, focus = null) => {
  const params = { text };
  if (focus && focus.lat && focus.lng) {
    params['focus.point.lat'] = focus.lat;
    params['focus.point.lon'] = focus.lng;
  }
  return fetchVietmap('search/v3', params);
};

/**
 * Address autocomplete for search boxes & room address inputs
 */
const autocomplete = async (text, focus = null) => {
  const params = { text };
  if (focus && focus.lat && focus.lng) {
    params['focus.point.lat'] = focus.lat;
    params['focus.point.lon'] = focus.lng;
  }
  return fetchVietmap('autocomplete/v3', params);
};

/**
 * Reverse geocoding: coordinates (lat, lng) to Vietnamese address
 */
const reverseGeocode = async (lat, lng) => {
  return fetchVietmap('reverse/v3', { lat, lng });
};

/**
 * Calculate routing & travel distance between points
 * @param {Array<{lat: number, lng: number}>} points
 * @param {string} vehicle - 'car' | 'bike' | 'foot' | 'motorcycle'
 */
const calculateRoute = async (points, vehicle = 'motorcycle') => {
  const apiKey = vietmapConfig.apiKey;
  if (!apiKey) {
    throw new Error('VIETMAP_API_KEY is not configured in environment variables.');
  }

  const pointQueries = points.map((p) => `point=${p.lat},${p.lng}`).join('&');
  const url = `${vietmapConfig.baseUrl}/route?api-version=1.1&apikey=${apiKey}&vehicle=${vehicle}&${pointQueries}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || 'Vietmap Routing request failed'));
          }
        } catch (err) {
          reject(new Error(`Failed to parse Vietmap Routing response: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Vietmap network error: ${err.message}`));
    });
  });
};

module.exports = {
  searchAddress,
  autocomplete,
  reverseGeocode,
  calculateRoute,
};
