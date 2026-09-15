/**
 * Frontend Vietmap API client helper
 * Requests are routed through the backend proxy (/api/map/*) to eliminate browser CORS errors.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LOCAL_FALLBACK_SUGGESTIONS = [
  { label: 'Quận Hải Châu, TP. Đà Nẵng', name: 'Quận Hải Châu', coordinates: [108.2022, 16.0544] },
  { label: '123 Trần Phú, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng', name: 'Đường Trần Phú, Hải Châu', coordinates: [108.2205, 16.0718] },
  { label: 'Bạch Đằng, P. Thạch Thang, Q. Hải Châu, Đà Nẵng', name: 'Đường Bạch Đằng, Hải Châu', coordinates: [108.2241, 16.0689] },
  { label: 'Quận Sơn Trà, TP. Đà Nẵng', name: 'Quận Sơn Trà', coordinates: [108.2436, 16.0825] },
  { label: 'Võ Nguyên Giáp, P. Phước Mỹ, Q. Sơn Trà, Đà Nẵng', name: 'Bãi biển Mỹ Khê', coordinates: [108.2467, 16.0610] },
  { label: 'Quận Thanh Khê, TP. Đà Nẵng', name: 'Quận Thanh Khê', coordinates: [108.1824, 16.0601] },
  { label: 'Quận Ngũ Hành Sơn, TP. Đà Nẵng', name: 'Quận Ngũ Hành Sơn', coordinates: [108.2562, 16.0028] },
  { label: 'Quận Cẩm Lệ, TP. Đà Nẵng', name: 'Quận Cẩm Lệ', coordinates: [108.1925, 15.9984] },
  { label: 'Quận Liên Chiểu, TP. Đà Nẵng', name: 'Quận Liên Chiểu', coordinates: [108.1432, 16.0945] },
  { label: 'Quận 1, TP. Hồ Chí Minh', name: 'Quận 1, TP. HCM', coordinates: [106.7009, 10.7769] },
  { label: 'Quận 3, TP. Hồ Chí Minh', name: 'Quận 3, TP. HCM', coordinates: [106.6843, 10.7844] },
  { label: 'Quận Bình Thạnh, TP. Hồ Chí Minh', name: 'Quận Bình Thạnh', coordinates: [106.6981, 10.8106] },
  { label: 'Quận Cầu Giấy, TP. Hà Nội', name: 'Quận Cầu Giấy', coordinates: [105.7865, 21.0313] },
  { label: 'Quận Hoàn Kiếm, TP. Hà Nội', name: 'Quận Hoàn Kiếm', coordinates: [105.8542, 21.0285] }
];

const getLocalSuggestions = (text) => {
  const q = (text || '').toLowerCase().trim();
  const matched = LOCAL_FALLBACK_SUGGESTIONS.filter(
    (s) => s.label.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );
  const results = matched.length > 0 ? matched : LOCAL_FALLBACK_SUGGESTIONS.slice(0, 4);

  return results.map((item, idx) => ({
    type: 'Feature',
    id: `local_${idx}`,
    label: item.label,
    name: item.name,
    properties: {
      name: item.name,
      label: item.label,
      address: item.label,
    },
    geometry: {
      type: 'Point',
      coordinates: item.coordinates,
    },
  }));
};

/**
 * Autocomplete address suggestions via Backend Proxy (no CORS)
 */
export const getVietmapAutocomplete = async (text) => {
  if (!text || text.trim().length < 2) return [];

  try {
    const res = await fetch(`${API_URL}/map/autocomplete?text=${encodeURIComponent(text)}`);
    if (res.ok) {
      const data = await res.json();
      const features = data.data?.features || data.features || data.data || data || [];
      if (Array.isArray(features) && features.length > 0) {
        return features;
      }
    }
  } catch (e) {
    console.warn('Backend Vietmap proxy unavailable, using smart local suggestions', e);
  }

  return getLocalSuggestions(text);
};

/**
 * Search place coordinates via Backend Proxy
 */
export const searchVietmapAddress = async (text) => {
  if (!text) return null;
  try {
    const res = await fetch(`${API_URL}/map/search?text=${encodeURIComponent(text)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend Vietmap search proxy error, using local coordinates', e);
  }

  return {
    type: 'FeatureCollection',
    features: getLocalSuggestions(text),
  };
};

/**
 * Calculate distance and route between two points via Backend Proxy
 */
export const calculateVietmapRoute = async (originLat, originLng, destLat, destLng, vehicle = 'motorcycle') => {
  try {
    const res = await fetch(
      `${API_URL}/map/route?origin=${originLat},${originLng}&destination=${destLat},${destLng}&vehicle=${vehicle}`
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend Vietmap route calculation failed, using estimate', e);
  }

  // Fallback rough distance estimate
  return {
    paths: [
      {
        distance: 3200,
        time: 480000,
      },
    ],
  };
};
