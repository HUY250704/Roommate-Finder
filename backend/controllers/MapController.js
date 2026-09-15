const { searchAddress, autocomplete, reverseGeocode, calculateRoute } = require('../services/vietmapService');

// Local fallback dictionary for Vietnam locations to handle 429/offline/rate-limit gracefully
const localLocations = [
  { name: 'Quận Hải Châu, Đà Nẵng', address: 'Quận Hải Châu, TP. Đà Nẵng', lat: 16.0544, lng: 108.2022 },
  { name: 'Đường Trần Phú, Hải Châu, Đà Nẵng', address: '123 Trần Phú, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng', lat: 16.0718, lng: 108.2205 },
  { name: 'Đường Bạch Đằng, Hải Châu, Đà Nẵng', address: 'Bạch Đằng, P. Thạch Thang, Q. Hải Châu, Đà Nẵng', lat: 16.0689, lng: 108.2241 },
  { name: 'Quận Sơn Trà, Đà Nẵng', address: 'Quận Sơn Trà, TP. Đà Nẵng', lat: 16.0825, lng: 108.2436 },
  { name: 'Bãi biển Mỹ Khê, Sơn Trà, Đà Nẵng', address: 'Võ Nguyên Giáp, P. Phước Mỹ, Q. Sơn Trà, Đà Nẵng', lat: 16.0610, lng: 108.2467 },
  { name: 'Quận Thanh Khê, Đà Nẵng', address: 'Quận Thanh Khê, TP. Đà Nẵng', lat: 16.0601, lng: 108.1824 },
  { name: 'Quận Ngũ Hành Sơn, Đà Nẵng', address: 'Quận Ngũ Hành Sơn, TP. Đà Nẵng', lat: 16.0028, lng: 108.2562 },
  { name: 'Quận Cẩm Lệ, Đà Nẵng', address: 'Quận Cẩm Lệ, TP. Đà Nẵng', lat: 15.9984, lng: 108.1925 },
  { name: 'Quận Liên Chiểu, Đà Nẵng', address: 'Quận Liên Chiểu, TP. Đà Nẵng', lat: 16.0945, lng: 108.1432 },
  { name: 'Quận 1, Thành phố Hồ Chí Minh', address: 'Quận 1, TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7009 },
  { name: 'Quận 3, Thành phố Hồ Chí Minh', address: 'Quận 3, TP. Hồ Chí Minh', lat: 10.7844, lng: 106.6843 },
  { name: 'Quận Bình Thạnh, Thành phố Hồ Chí Minh', address: 'Quận Bình Thạnh, TP. Hồ Chí Minh', lat: 10.8106, lng: 106.6981 },
  { name: 'Quận Cầu Giấy, Hà Nội', address: 'Quận Cầu Giấy, TP. Hà Nội', lat: 21.0313, lng: 105.7865 },
  { name: 'Quận Hoàn Kiếm, Hà Nội', address: 'Quận Hoàn Kiếm, TP. Hà Nội', lat: 21.0285, lng: 105.8542 }
];

const fallbackFeatures = (text) => {
  const q = text.toLowerCase().trim();
  const matched = localLocations.filter(
    (l) => l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
  );
  const items = matched.length > 0 ? matched : localLocations.slice(0, 4);
  return items.map((item, idx) => ({
    type: 'Feature',
    id: `local_${idx}_${Date.now()}`,
    properties: {
      name: item.name,
      label: item.address,
      address: item.address,
    },
    geometry: {
      type: 'Point',
      coordinates: [item.lng, item.lat],
    },
  }));
};

const search = async (req, res) => {
  try {
    const { text, lat, lng } = req.query;
    if (!text) {
      return res.status(400).json({ message: 'Vui lòng cung cấp chuỗi tìm kiếm text' });
    }

    const focus = lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
    try {
      const data = await searchAddress(text, focus);
      return res.status(200).json(data);
    } catch (apiErr) {
      console.warn('Vietmap search API error, returning smart fallback:', apiErr.message);
      return res.status(200).json({
        type: 'FeatureCollection',
        features: fallbackFeatures(text),
      });
    }
  } catch (error) {
    return res.status(200).json({
      type: 'FeatureCollection',
      features: fallbackFeatures(req.query.text || 'Đà Nẵng'),
    });
  }
};

const getAutocomplete = async (req, res) => {
  try {
    const { text, lat, lng } = req.query;
    if (!text) {
      return res.status(400).json({ message: 'Vui lòng cung cấp chuỗi gợi ý text' });
    }

    const focus = lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
    try {
      const data = await autocomplete(text, focus);
      return res.status(200).json(data);
    } catch (apiErr) {
      console.warn('Vietmap autocomplete API rate limit/error, returning smart fallback:', apiErr.message);
      return res.status(200).json({
        type: 'FeatureCollection',
        features: fallbackFeatures(text),
      });
    }
  } catch (error) {
    return res.status(200).json({
      type: 'FeatureCollection',
      features: fallbackFeatures(req.query.text || 'Đà Nẵng'),
    });
  }
};

const reverse = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tọa độ lat và lng' });
    }

    try {
      const data = await reverseGeocode(Number(lat), Number(lng));
      return res.status(200).json(data);
    } catch (apiErr) {
      return res.status(200).json({
        address: 'Quận Hải Châu, TP. Đà Nẵng',
        lat: Number(lat),
        lng: Number(lng),
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Lỗi khi giải mã tọa độ Vietmap' });
  }
};

const getRoute = async (req, res) => {
  try {
    const { origin, destination, vehicle } = req.query;
    if (!origin || !destination) {
      return res.status(400).json({ message: 'Vui lòng cung cấp origin=lat,lng và destination=lat,lng' });
    }

    const [origLat, origLng] = origin.split(',').map(Number);
    const [destLat, destLng] = destination.split(',').map(Number);

    if (isNaN(origLat) || isNaN(origLng) || isNaN(destLat) || isNaN(destLng)) {
      return res.status(400).json({ message: 'Tọa độ không hợp lệ, định dạng chuẩn: lat,lng' });
    }

    const points = [
      { lat: origLat, lng: origLng },
      { lat: destLat, lng: destLng },
    ];

    try {
      const data = await calculateRoute(points, vehicle || 'motorcycle');
      return res.status(200).json(data);
    } catch (apiErr) {
      console.warn('Vietmap routing error, returning estimated route:', apiErr.message);
      // Rough distance formula fallback in meters
      const radlat1 = (Math.PI * origLat) / 180;
      const radlat2 = (Math.PI * destLat) / 180;
      const theta = origLng - destLng;
      const radtheta = (Math.PI * theta) / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(Math.min(1, Math.max(-1, dist)));
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515 * 1609.344; // in meters
      const distMeters = Math.max(800, Math.round(dist * 1.25)); // approximate street factor
      const timeMs = Math.round((distMeters / 6.94) * 1000); // motorcycle ~25km/h

      return res.status(200).json({
        paths: [
          {
            distance: distMeters,
            time: timeMs,
            weight: timeMs,
          },
        ],
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Lỗi khi tính toán tuyến đường Vietmap' });
  }
};

module.exports = {
  search,
  getAutocomplete,
  reverse,
  getRoute,
};
