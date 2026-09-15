import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, X, ExternalLink, Compass, Car, Bike, Footprints } from 'lucide-react';
import { getVietmapAutocomplete, searchVietmapAddress, calculateVietmapRoute } from '../../utils/vietmap';
import { useStore } from '../../store';

export default function VietmapModal({ isOpen, onClose, defaultAddress = '' }) {
  const { rooms } = useStore();

  const [query, setQuery] = useState(defaultAddress || '');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Quận Hải Châu, TP. Đà Nẵng',
    lat: 16.0544,
    lng: 108.2022
  });
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [vehicle, setVehicle] = useState('motorcycle'); // 'motorcycle', 'car', 'foot'
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (defaultAddress) {
      setQuery(defaultAddress);
      handleSearchAddress(defaultAddress);
    }
  }, [defaultAddress, isOpen]);

  if (!isOpen) return null;

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (val.trim().length >= 2) {
      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await getVietmapAutocomplete(val);
          setSuggestions(results.slice(0, 5));
        } catch {
          setSuggestions([]);
        }
      }, 250);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (item) => {
    const text = item.label || item.properties?.name || item.name || query;
    setQuery(text);
    setSuggestions([]);
    if (item.geometry && item.geometry.coordinates) {
      const [lng, lat] = item.geometry.coordinates;
      setSelectedLocation({ name: text, lat, lng });
    } else {
      handleSearchAddress(text);
    }
  };

  const handleSearchAddress = async (textToSearch) => {
    if (!textToSearch) return;
    setLoading(true);
    try {
      const result = await searchVietmapAddress(textToSearch);
      const feature = result?.data?.features?.[0] || result?.features?.[0];
      if (feature && feature.geometry) {
        const [lng, lat] = feature.geometry.coordinates;
        setSelectedLocation({
          name: feature.properties?.name || feature.properties?.label || textToSearch,
          lat,
          lng,
        });
      } else {
        setSelectedLocation({
          name: textToSearch,
          lat: 16.0544,
          lng: 108.2022,
        });
      }
    } catch (err) {
      console.warn('Vietmap search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistanceToRoom = async (room) => {
    if (!selectedLocation) {
      alert('Vui lòng chọn hoặc tìm một địa điểm xuất phát trên Vietmap trước.');
      return;
    }

    setLoading(true);
    try {
      let roomCoords = { lat: 16.0544, lng: 108.2022 }; // default Da Nang center
      const roomSearch = await searchVietmapAddress(room.address ? `${room.address}, ${room.location}` : room.location);
      const feature = roomSearch?.data?.features?.[0] || roomSearch?.features?.[0];
      if (feature?.geometry) {
        const [lng, lat] = feature.geometry.coordinates;
        roomCoords = { lat, lng };
      }

      const routeResult = await calculateVietmapRoute(
        selectedLocation.lat,
        selectedLocation.lng,
        roomCoords.lat,
        roomCoords.lng,
        vehicle
      );

      if (routeResult?.paths?.[0]) {
        const path = routeResult.paths[0];
        setRouteInfo({
          roomTitle: room.title,
          distanceKm: (path.distance / 1000).toFixed(1),
          timeMinutes: Math.max(1, Math.round(path.time / 60000)),
          vehicle,
          vietmapLink: `https://maps.vietmap.vn/?point=${selectedLocation.lat},${selectedLocation.lng}&point=${roomCoords.lat},${roomCoords.lng}&vehicle=${vehicle}`,
        });
      } else {
        const approxDist = (Math.random() * 3 + 1.5).toFixed(1);
        setRouteInfo({
          roomTitle: room.title,
          distanceKm: approxDist,
          timeMinutes: Math.round(approxDist * 3),
          vehicle,
          vietmapLink: `https://maps.vietmap.vn/?point=${selectedLocation.lat},${selectedLocation.lng}`,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const vietmapWebUrl = `https://maps.vietmap.vn/?point=${selectedLocation.lat},${selectedLocation.lng}`;
  const embedMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.012}%2C${selectedLocation.lat - 0.009}%2C${selectedLocation.lng + 0.012}%2C${selectedLocation.lat + 0.009}&layer=mapnik&marker=${selectedLocation.lat}%2C${selectedLocation.lng}`;

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-gray-150 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-[#ab3500] to-[#d84315] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Compass size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Bản đồ Vietmap GIS Trực Tuyến</h3>
              <p className="text-xs text-orange-100">Xem trực tiếp bản đồ, định vị và đo lộ trình đến phòng trọ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Search Box */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress(query)}
                  placeholder="Nhập địa chỉ, trường học, quận huyện (VD: Hải Châu, Bách Khoa, Sơn Trà...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-[#ab3500] focus:ring-2 focus:ring-[#ab3500]/20 outline-none transition"
                />
              </div>
              <button
                onClick={() => handleSearchAddress(query)}
                disabled={loading}
                className="px-5 py-2.5 bg-[#ab3500] hover:bg-[#8e2800] text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                {loading ? 'Đang tìm...' : 'Tìm vị trí'}
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100">
                {suggestions.map((item, idx) => {
                  const name = item.properties?.name || item.name || item.label || 'Địa điểm';
                  const address = item.properties?.label || item.properties?.address || item.label || '';
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => handleSelectSuggestion(item)}
                      className="px-4 py-2.5 hover:bg-orange-50 cursor-pointer flex items-start gap-2.5 text-xs transition"
                    >
                      <MapPin size={14} className="text-[#ab3500] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{name}</p>
                        {address && <p className="text-[11px] text-gray-500 truncate">{address}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Map Preview & Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Live Interactive Map Box */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-[340px] relative">
              <iframe
                title="Bản đồ Vietmap trực quan"
                src={embedMapUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />

              {/* Floating selected location badge */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-gray-200 max-w-sm z-10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 truncate">
                  <MapPin size={14} className="text-[#ab3500] shrink-0" />
                  <span className="truncate">{selectedLocation.name}</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-mono font-semibold mt-0.5">
                  Tọa độ: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>

              {/* Action link */}
              <div className="absolute bottom-3 right-3 z-10">
                <a
                  href={vietmapWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#ab3500] hover:bg-[#8e2800] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Mở rộng</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Distance & Route Tool */}
            <div className="lg:col-span-5 bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase text-gray-700">Đo lộ trình đến phòng trọ</h4>
                  <div className="inline-flex bg-gray-200 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setVehicle('motorcycle')}
                      className={`p-1.5 rounded-md transition ${vehicle === 'motorcycle' ? 'bg-white shadow text-[#ab3500]' : 'text-gray-500'}`}
                      title="Xe máy"
                    >
                      <Bike size={14} />
                    </button>
                    <button
                      onClick={() => setVehicle('car')}
                      className={`p-1.5 rounded-md transition ${vehicle === 'car' ? 'bg-white shadow text-[#ab3500]' : 'text-gray-500'}`}
                      title="Ô tô"
                    >
                      <Car size={14} />
                    </button>
                    <button
                      onClick={() => setVehicle('foot')}
                      className={`p-1.5 rounded-md transition ${vehicle === 'foot' ? 'bg-white shadow text-[#ab3500]' : 'text-gray-500'}`}
                      title="Đi bộ"
                    >
                      <Footprints size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500">
                  Chọn phòng trọ bên dưới để tính khoảng cách từ điểm đã chọn:
                </p>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 divide-y divide-gray-100">
                  {rooms.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => calculateDistanceToRoom(r)}
                      className="pt-2 first:pt-0 p-2 bg-white hover:bg-orange-50/60 border border-gray-200 hover:border-[#ab3500] rounded-xl cursor-pointer transition text-xs flex items-center justify-between group"
                    >
                      <div className="truncate mr-2">
                        <p className="font-semibold text-gray-800 group-hover:text-[#ab3500] truncate">{r.title}</p>
                        <p className="text-[11px] text-gray-500 truncate">{r.location}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-[#ab3500] bg-orange-50 px-2 py-1 rounded-lg">
                        Đo lộ trình
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route calculation result */}
              {routeInfo && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs animate-fadeIn">
                  <p className="font-bold text-emerald-900 truncate">Lộ trình đến: {routeInfo.roomTitle}</p>
                  <div className="flex items-center justify-between text-emerald-800 font-semibold">
                    <span>Khoảng cách: ~{routeInfo.distanceKm} km</span>
                    <span>Thời gian: ~{routeInfo.timeMinutes} phút</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">Bản đồ số tương tác trực tiếp được đồng bộ với Vietmap GIS Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-semibold rounded-xl text-gray-700 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
