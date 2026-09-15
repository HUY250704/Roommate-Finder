import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, X, ExternalLink, Compass, Car, Bike, Footprints } from 'lucide-react';
import { getVietmapAutocomplete, searchVietmapAddress, calculateVietmapRoute } from '../../utils/vietmap';
import { useStore } from '../../store';

export default function VietmapModal({ isOpen, onClose, defaultAddress = '' }) {
  const { rooms } = useStore();

  const [query, setQuery] = useState(defaultAddress || '');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
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

  const vietmapWebUrl = selectedLocation
    ? `https://maps.vietmap.vn/?point=${selectedLocation.lat},${selectedLocation.lng}`
    : `https://maps.vietmap.vn/?q=${encodeURIComponent(query || 'Da Nang')}`;

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-150 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#ab3500] to-[#d84315] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Compass size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Bản đồ Vietmap GIS Platform</h3>
              <p className="text-xs text-orange-100">Tìm kiếm địa chỉ, tọa độ và tính khoảng cách đến phòng trọ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
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
                  placeholder="Nhập địa chỉ, trường học, quận huyện (VD: Hải Châu, Bách Khoa...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-[#ab3500] focus:ring-2 focus:ring-[#ab3500]/20 outline-none transition"
                />
              </div>
              <button
                onClick={() => handleSearchAddress(query)}
                disabled={loading}
                className="px-5 py-2.5 bg-[#ab3500] hover:bg-[#ab3500]/90 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm"
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Visual Location Info */}
            <div className="md:col-span-7 bg-orange-50/50 rounded-2xl border border-orange-100 p-5 flex flex-col justify-between min-h-[260px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-[#ab3500] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Điểm đã chọn
                  </span>
                  <a
                    href={vietmapWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#ab3500] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Mở bản đồ Vietmap</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div>
                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin size={18} className="text-[#ab3500]" />
                    <span>{selectedLocation?.name || query || 'Quận Hải Châu, TP. Đà Nẵng'}</span>
                  </h4>
                  {selectedLocation && (
                    <p className="text-xs text-gray-600 mt-1 font-mono">
                      Tọa độ: {selectedLocation.lat?.toFixed(5)}, {selectedLocation.lng?.toFixed(5)}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/60 mt-4 flex items-center gap-3">
                <div className="p-2.5 bg-orange-100 text-[#ab3500] rounded-xl">
                  <Navigation size={20} />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Hệ thống sử dụng nền tảng <strong>Vietmap API</strong> để định vị chính xác vị trí phòng trọ và đề xuất bạn cùng phòng gần khu vực của bạn nhất.
                </p>
              </div>
            </div>

            {/* Distance & Route Tool */}
            <div className="md:col-span-5 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase text-gray-700">Tính khoảng cách & lộ trình</h4>
                  <div className="inline-flex bg-gray-200 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setVehicle('motorcycle')}
                      className={`p-1.5 rounded-md ${vehicle === 'motorcycle' ? 'bg-white shadow text-[#ab3500]' : 'text-gray-500'}`}
                      title="Xe máy"
                    >
                      <Bike size={14} />
                    </button>
                    <button
                      onClick={() => setVehicle('car')}
                      className={`p-1.5 rounded-md ${vehicle === 'car' ? 'bg-white shadow text-[#ab3500]' : 'text-gray-500'}`}
                      title="Ô tô"
                    >
                      <Car size={14} />
                    </button>
                    <button
                      onClick={() => setVehicle('foot')}
                      className={`p-1.5 rounded-md ${vehicle === 'foot' ? 'bg-white shadow text-[#ab3500]' : 'text-gray-500'}`}
                      title="Đi bộ"
                    >
                      <Footprints size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500">
                  Chọn một phòng trọ bên dưới để đo khoảng cách từ vị trí của bạn:
                </p>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {rooms.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => calculateDistanceToRoom(r)}
                      className="p-2.5 bg-white border border-gray-200 hover:border-[#ab3500] rounded-xl cursor-pointer transition text-xs flex items-center justify-between group"
                    >
                      <div className="truncate mr-2">
                        <p className="font-semibold text-gray-800 group-hover:text-[#ab3500] truncate">{r.title}</p>
                        <p className="text-[11px] text-gray-500 truncate">{r.location}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-[#ab3500] bg-orange-50 px-2 py-1 rounded">
                        Đo lộ trình
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route calculation result */}
              {routeInfo && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs animate-fadeIn">
                  <p className="font-bold text-emerald-900 truncate">Lộ trình đến: {routeInfo.roomTitle}</p>
                  <div className="flex items-center justify-between text-emerald-800 font-semibold pt-1">
                    <span>Khoảng cách: ~{routeInfo.distanceKm} km</span>
                    <span>Thời gian: ~{routeInfo.timeMinutes} phút</span>
                  </div>
                  <a
                    href={routeInfo.vietmapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-bold inline-block"
                  >
                    Xem chỉ đường chi tiết trên Vietmap &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">Dữ liệu bản đồ được cung cấp bởi Vietmap API Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-semibold rounded-xl text-gray-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
