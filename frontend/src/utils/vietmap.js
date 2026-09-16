/**
 * Frontend Vietmap & GIS Map API Client Helper
 * Provides autocomplete, geocoding search, and routing.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const normalizeStr = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim();
};

const VIETNAM_LOCATIONS = [
  // Đà Nẵng
  { label: 'Quận Hải Châu, TP. Đà Nẵng', name: 'Quận Hải Châu', coordinates: [108.2022, 16.0544], category: 'district' },
  { label: '123 Trần Phú, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng', name: '123 Trần Phú, Hải Châu', coordinates: [108.2205, 16.0718], category: 'street' },
  { label: 'Bạch Đằng, P. Thạch Thang, Q. Hải Châu, Đà Nẵng', name: 'Đường Bạch Đằng, Hải Châu', coordinates: [108.2241, 16.0689], category: 'street' },
  { label: 'Nguyễn Văn Linh, P. Nam Dương, Q. Hải Châu, Đà Nẵng', name: 'Đường Nguyễn Văn Linh, Hải Châu', coordinates: [108.2167, 16.0602], category: 'street' },
  { label: 'Cầu Rồng, P. Phước Ninh, Q. Hải Châu, Đà Nẵng', name: 'Cầu Rồng Đà Nẵng', coordinates: [108.2272, 16.0611], category: 'landmark' },
  { label: 'Cầu Sông Hàn, P. An Hải Bắc, Q. Sơn Trà, Đà Nẵng', name: 'Cầu Sông Hàn', coordinates: [108.2278, 16.0722], category: 'landmark' },
  { label: 'Quận Sơn Trà, TP. Đà Nẵng', name: 'Quận Sơn Trà', coordinates: [108.2436, 16.0825], category: 'district' },
  { label: 'Võ Nguyên Giáp, P. Phước Mỹ, Q. Sơn Trà, Đà Nẵng', name: 'Bãi biển Mỹ Khê', coordinates: [108.2467, 16.0610], category: 'landmark' },
  { label: '45 Võ Nguyên Giáp, P. Phước Mỹ, Q. Sơn Trà, Đà Nẵng', name: '45 Võ Nguyên Giáp, Sơn Trà', coordinates: [108.2467, 16.0610], category: 'street' },
  { label: 'Quận Thanh Khê, TP. Đà Nẵng', name: 'Quận Thanh Khê', coordinates: [108.1824, 16.0601], category: 'district' },
  { label: 'Điện Biên Phủ, P. Chính Gián, Q. Thanh Khê, Đà Nẵng', name: 'Đường Điện Biên Phủ', coordinates: [108.1921, 16.0637], category: 'street' },
  { label: 'Quận Ngũ Hành Sơn, TP. Đà Nẵng', name: 'Quận Ngũ Hành Sơn', coordinates: [108.2562, 16.0028], category: 'district' },
  { label: '71 Ngũ Hành Sơn, P. Mỹ An, Q. Ngũ Hành Sơn, Đà Nẵng', name: 'Đại học Kinh Tế Đà Nẵng (DUE)', coordinates: [108.2394, 16.0506], category: 'university' },
  { label: 'Quận Liên Chiểu, TP. Đà Nẵng', name: 'Quận Liên Chiểu', coordinates: [108.1432, 16.0945], category: 'district' },
  { label: '54 Nguyễn Lương Bằng, P. Hòa Khánh Bắc, Q. Liên Chiểu, Đà Nẵng', name: 'Đại học Bách Khoa Đà Nẵng (DUT)', coordinates: [108.1499, 16.0739], category: 'university' },
  { label: '459 Tôn Đức Thắng, P. Hòa Khánh Nam, Q. Liên Chiểu, Đà Nẵng', name: 'Đại học Sư Phạm Đà Nẵng', coordinates: [108.1589, 16.0583], category: 'university' },
  { label: '254 Nguyễn Văn Linh, P. Thạc Gián, Q. Thanh Khê, Đà Nẵng', name: 'Đại học Duy Tân Đà Nẵng', coordinates: [108.2114, 16.0608], category: 'university' },
  { label: 'Khu Đô thị FPT City, P. Hòa Hải, Q. Ngũ Hành Sơn, Đà Nẵng', name: 'Đại học FPT Đà Nẵng', coordinates: [108.2612, 15.9721], category: 'university' },
  { label: 'Quận Cẩm Lệ, TP. Đà Nẵng', name: 'Quận Cẩm Lệ', coordinates: [108.1925, 15.9984], category: 'district' },

  // TP. Hồ Chí Minh
  { label: 'Quận 1, TP. Hồ Chí Minh', name: 'Quận 1, TP. HCM', coordinates: [106.7009, 10.7769], category: 'district' },
  { label: 'Quận 3, TP. Hồ Chí Minh', name: 'Quận 3, TP. HCM', coordinates: [106.6843, 10.7844], category: 'district' },
  { label: 'Quận 5, TP. Hồ Chí Minh', name: 'Quận 5, TP. HCM', coordinates: [106.6669, 10.7554], category: 'district' },
  { label: 'Quận 7, TP. Hồ Chí Minh', name: 'Quận 7, TP. HCM', coordinates: [106.7218, 10.7340], category: 'district' },
  { label: 'Quận 10, TP. Hồ Chí Minh', name: 'Quận 10, TP. HCM', coordinates: [106.6672, 10.7716], category: 'district' },
  { label: 'Quận Bình Thạnh, TP. Hồ Chí Minh', name: 'Quận Bình Thạnh', coordinates: [106.6981, 10.8106], category: 'district' },
  { label: 'TP. Thủ Đức, TP. Hồ Chí Minh', name: 'TP. Thủ Đức', coordinates: [106.7537, 10.8494], category: 'district' },
  { label: 'Quận Tân Bình, TP. Hồ Chí Minh', name: 'Quận Tân Bình', coordinates: [106.6526, 10.8015], category: 'district' },
  { label: 'Quận Gò Vấp, TP. Hồ Chí Minh', name: 'Quận Gò Vấp', coordinates: [106.6653, 10.8387], category: 'district' },
  { label: 'Khu phố 6, P. Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh', name: 'ĐHQG TP.HCM (Làng ĐH)', coordinates: [106.8031, 10.8700], category: 'university' },
  { label: '268 Lý Thường Kiệt, P. 14, Q. 10, TP. Hồ Chí Minh', name: 'Đại học Bách Khoa TP.HCM', coordinates: [106.6578, 10.7725], category: 'university' },
  { label: '19 Nguyễn Hữu Thọ, P. Tân Phong, Q. 7, TP. Hồ Chí Minh', name: 'Đại học Tôn Đức Thắng', coordinates: [106.6992, 10.7326], category: 'university' },
  { label: '59C Nguyễn Đình Chiểu, P. Võ Thị Sáu, Q. 3, TP. Hồ Chí Minh', name: 'Đại học Kinh Tế TP.HCM (UEH)', coordinates: [106.6958, 10.7828], category: 'university' },

  // Hà Nội
  { label: 'Quận Cầu Giấy, TP. Hà Nội', name: 'Quận Cầu Giấy', coordinates: [105.7865, 21.0313], category: 'district' },
  { label: 'Quận Hoàn Kiếm, TP. Hà Nội', name: 'Quận Hoàn Kiếm', coordinates: [105.8542, 21.0285], category: 'district' },
  { label: 'Quận Đống Đa, TP. Hà Nội', name: 'Quận Đống Đa', coordinates: [105.8248, 21.0181], category: 'district' },
  { label: 'Quận Hai Bà Trưng, TP. Hà Nội', name: 'Quận Hai Bà Trưng', coordinates: [105.8524, 21.0069], category: 'district' },
  { label: 'Quận Ba Đình, TP. Hà Nội', name: 'Quận Ba Đình', coordinates: [105.8205, 21.0341], category: 'district' },
  { label: 'Quận Thanh Xuân, TP. Hà Nội', name: 'Quận Thanh Xuân', coordinates: [105.8055, 20.9937], category: 'district' },
  { label: 'Quận Nam Từ Liêm, TP. Hà Nội', name: 'Quận Nam Từ Liêm', coordinates: [105.7645, 21.0163], category: 'district' },
  { label: 'Quận Bắc Từ Liêm, TP. Hà Nội', name: 'Quận Bắc Từ Liêm', coordinates: [105.7621, 21.0664], category: 'district' },
  { label: 'Số 1 Đại Cồ Việt, P. Bách Khoa, Q. Hai Bà Trưng, Hà Nội', name: 'Đại học Bách Khoa Hà Nội (HUST)', coordinates: [105.8434, 21.0044], category: 'university' },
  { label: '144 Xuân Thủy, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội', name: 'Đại học Quốc Gia Hà Nội', coordinates: [105.7818, 21.0373], category: 'university' },
  { label: '207 Giải Phóng, P. Đồng Tâm, Q. Hai Bà Trưng, Hà Nội', name: 'Đại học Kinh Tế Quốc Dân (NEU)', coordinates: [105.8427, 20.9996], category: 'university' },

  // Other Cities
  { label: 'Quận Ninh Kiều, TP. Cần Thơ', name: 'TP. Cần Thơ', coordinates: [105.7883, 10.0342], category: 'city' },
  { label: 'Quận Hồng Bàng, TP. Hải Phòng', name: 'TP. Hải Phòng', coordinates: [106.6881, 20.8449], category: 'city' },
  { label: 'TP. Huế, Tỉnh Thừa Thiên Huế', name: 'TP. Huế', coordinates: [107.5909, 16.4637], category: 'city' },
  { label: 'TP. Nha Trang, Tỉnh Khánh Hòa', name: 'TP. Nha Trang', coordinates: [109.1967, 12.2388], category: 'city' },
  { label: 'TP. Đà Lạt, Tỉnh Lâm Đồng', name: 'TP. Đà Lạt', coordinates: [108.4583, 11.9404], category: 'city' }
];

export const getLocalSuggestions = (text) => {
  const normQ = normalizeStr(text);
  if (!normQ) {
    return VIETNAM_LOCATIONS.slice(0, 5).map((item, idx) => ({
      type: 'Feature',
      id: `local_${idx}`,
      name: item.name,
      label: item.label,
      properties: {
        name: item.name,
        label: item.label,
        address: item.label,
        category: item.category,
      },
      geometry: {
        type: 'Point',
        coordinates: item.coordinates,
      },
    }));
  }

  const tokens = normQ.split(/\s+/).filter(Boolean);
  const scored = VIETNAM_LOCATIONS.map((item) => {
    const itemNorm = normalizeStr(`${item.name} ${item.label}`);
    let score = 0;
    if (itemNorm.includes(normQ)) score += 100;
    tokens.forEach((t) => {
      if (itemNorm.includes(t)) score += 20;
    });
    return { item, score };
  });

  const matched = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);

  const results = matched.length > 0 ? matched.slice(0, 7) : VIETNAM_LOCATIONS.slice(0, 4);

  return results.map((item, idx) => ({
    type: 'Feature',
    id: `local_${idx}_${Date.now()}`,
    name: item.name,
    label: item.label,
    properties: {
      name: item.name,
      label: item.label,
      address: item.label,
      category: item.category,
    },
    geometry: {
      type: 'Point',
      coordinates: item.coordinates,
    },
  }));
};

/**
 * Autocomplete address suggestions
 */
export const getVietmapAutocomplete = async (text) => {
  if (!text || text.trim().length === 0) return [];

  try {
    const res = await fetch(`${API_URL}/map/autocomplete?text=${encodeURIComponent(text)}`);
    if (res.ok) {
      const data = await res.json();
      const features = data.data?.features || data.features || data.data || [];
      if (Array.isArray(features) && features.length > 0) {
        return features;
      }
    }
  } catch (e) {
    // backend fallback
  }

  return getLocalSuggestions(text);
};

/**
 * Search place coordinates
 */
export const searchVietmapAddress = async (text) => {
  if (!text) return null;
  try {
    const res = await fetch(`${API_URL}/map/search?text=${encodeURIComponent(text)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.features?.length > 0 || data.data?.features?.length > 0)) {
        return data;
      }
    }
  } catch (e) {
    // backend fallback
  }

  return {
    type: 'FeatureCollection',
    features: getLocalSuggestions(text),
  };
};

/**
 * Calculate distance and route between two points
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
    // calculate on client
  }

  const R = 6371; // km
  const dLat = ((destLat - originLat) * Math.PI) / 180;
  const dLon = ((destLng - originLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((originLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distKm = R * c;
  const distMeters = Math.max(500, Math.round(distKm * 1.3 * 1000));
  const speedKmh = vehicle === 'foot' ? 4.5 : vehicle === 'car' ? 35 : 28;
  const timeMs = Math.round(((distMeters / 1000) / speedKmh) * 3600 * 1000);

  return {
    paths: [
      {
        distance: distMeters,
        time: timeMs,
      },
    ],
  };
};
