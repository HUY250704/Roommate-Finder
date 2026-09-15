/**
 * Frontend Vietmap API client helper
 */
const VIETMAP_API_KEY = import.meta.env.VITE_VIETMAP_API_KEY || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Autocomplete address suggestions
 */
export const getVietmapAutocomplete = async (text) => {
  if (!text || text.trim().length < 2) return [];

  // Try direct backend proxy first (avoids CORS issues)
  try {
    const res = await fetch(`${API_URL}/map/autocomplete?text=${encodeURIComponent(text)}`);
    if (res.ok) {
      const data = await res.json();
      return data.data?.features || data.features || data.data || data || [];
    }
  } catch (e) {
    console.warn('Backend Vietmap autocomplete proxy failed, checking direct API', e);
  }

  // Fallback to direct Vietmap API if client has a valid API Key configured
  if (VIETMAP_API_KEY && VIETMAP_API_KEY !== 'your_vietmap_api_key') {
    try {
      const res = await fetch(`https://maps.vietmap.vn/api/autocomplete/v3?apikey=${VIETMAP_API_KEY}&text=${encodeURIComponent(text)}`);
      if (res.ok) {
        const data = await res.json();
        return data.data?.features || data.features || data.data || data || [];
      }
    } catch (e) {
      console.warn('Direct Vietmap autocomplete error', e);
    }
  }

  return [];
};

/**
 * Search place coordinates
 */
export const searchVietmapAddress = async (text) => {
  if (!text) return null;
  try {
    const res = await fetch(`${API_URL}/map/search?text=${encodeURIComponent(text)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend Vietmap search proxy failed', e);
  }
  return null;
};

/**
 * Calculate distance and route between two points
 */
export const calculateVietmapRoute = async (originLat, originLng, destLat, destLng, vehicle = 'motorcycle') => {
  try {
    const res = await fetch(`${API_URL}/map/route?origin=${originLat},${originLng}&destination=${destLat},${destLng}&vehicle=${vehicle}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Vietmap route calculation failed', e);
  }
  return null;
};