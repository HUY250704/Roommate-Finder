const { searchAddress, autocomplete, reverseGeocode, calculateRoute } = require('../services/vietmapService');

const search = async (req, res) => {
  try {
    const { text, lat, lng } = req.query;
    if (!text) {
      return res.status(400).json({ message: 'Vui lòng cung cấp chuỗi tìm kiếm text' });
    }

    const focus = lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
    const data = await searchAddress(text, focus);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Lỗi khi tìm kiếm địa chỉ Vietmap' });
  }
};

const getAutocomplete = async (req, res) => {
  try {
    const { text, lat, lng } = req.query;
    if (!text) {
      return res.status(400).json({ message: 'Vui lòng cung cấp chuỗi gợi ý text' });
    }

    const focus = lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
    const data = await autocomplete(text, focus);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Lỗi khi lấy gợi ý Vietmap' });
  }
};

const reverse = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tọa độ lat và lng' });
    }

    const data = await reverseGeocode(Number(lat), Number(lng));
    return res.status(200).json(data);
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

    const data = await calculateRoute(points, vehicle || 'motorcycle');
    return res.status(200).json(data);
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
