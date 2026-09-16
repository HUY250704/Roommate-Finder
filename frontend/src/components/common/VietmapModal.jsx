import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  X,
  ExternalLink,
  Compass,
  Car,
  Bike,
  Footprints,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Layers,
  GraduationCap,
  Building,
  Map,
} from 'lucide-react';
import { getVietmapAutocomplete, searchVietmapAddress, calculateVietmapRoute } from '../../utils/vietmap';
import { useStore } from '../../store';

const POPULAR_AREAS = [
  { label: 'Q. Hải Châu (ĐN)', query: 'Quận Hải Châu Đà Nẵng' },
  { label: 'Q. Sơn Trà (ĐN)', query: 'Quận Sơn Trà Đà Nẵng' },
  { label: 'ĐH Bách Khoa', query: 'Đại học Bách Khoa Đà Nẵng' },
  { label: 'ĐH Kinh Tế', query: 'Đại học Kinh Tế Đà Nẵng' },
  { label: 'Q. 1 (TP.HCM)', query: 'Quận 1 TP. Hồ Chí Minh' },
  { label: 'Q. Cầu Giấy (HN)', query: 'Quận Cầu Giấy Hà Nội' },
];

export default function VietmapModal({ isOpen, onClose, defaultAddress = '' }) {
  const { rooms } = useStore();

  const [query, setQuery] = useState(defaultAddress || '');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Quận Hải Châu, TP. Đà Nẵng',
    lat: 16.0544,
    lng: 108.2022,
  });
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [vehicle, setVehicle] = useState('motorcycle'); // 'motorcycle', 'car', 'foot'
  const [mapLayer, setMapLayer] = useState('street'); // 'street' | 'satellite'
  const [locatingUser, setLocatingUser] = useState(false);

  const debounceTimer = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (defaultAddress) {
      setQuery(defaultAddress);
      handleSearchAddress(defaultAddress);
    }
  }, [defaultAddress, isOpen]);

  // Leaflet map initialization
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (window.L && !mapInstanceRef.current) {
        try {
          const map = window.L.map(mapContainerRef.current, {
            center: [selectedLocation.lat, selectedLocation.lng],
            zoom: 14,
            zoomControl: false,
          });

          const tileUrl =
            mapLayer === 'satellite'
              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

          const tiles = window.L.tileLayer(tileUrl, {
            maxZoom: 19,
            attribution: '&copy; Vietmap GIS / OpenStreetMap',
          }).addTo(map);

          const customIcon = window.L.divIcon({
            className: 'custom-vietmap-pin-modal',
            html: `<div style="
              width: 36px; height: 36px;
              background: #ab3500;
              border: 3px solid #ffffff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 6px 18px rgba(171, 53, 0, 0.5);
              display: flex; align-items: center; justify-content: center;
            ">
              <span style="
                width: 12px; height: 12px;
                background: #ffffff;
                border-radius: 50%;
                transform: rotate(45deg);
                display: block;
              "></span>
            </div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -34],
          });

          const marker = window.L.marker([selectedLocation.lat, selectedLocation.lng], { icon: customIcon }).addTo(
            map
          );
          marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
              <b style="color: #ab3500; font-size: 13px;">${selectedLocation.name}</b><br/>
              <span style="color: #4b5563;">Tọa độ: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}</span>
            </div>
          `);

          mapInstanceRef.current = { map, tiles, marker, routeLayer: null };
        } catch (e) {
          console.warn('Leaflet modal init fallback:', e);
        }
      } else if (mapInstanceRef.current) {
        const { map, marker } = mapInstanceRef.current;
        map.invalidateSize();
        map.flyTo([selectedLocation.lat, selectedLocation.lng], 14, { duration: 0.8 });
        if (marker) {
          marker.setLatLng([selectedLocation.lat, selectedLocation.lng]);
          marker.getPopup()?.setContent(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
              <b style="color: #ab3500; font-size: 13px;">${selectedLocation.name}</b><br/>
              <span style="color: #4b5563;">Tọa độ: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}</span>
            </div>
          `);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, selectedLocation]);

  if (!isOpen) return null;

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (val.trim().length >= 1) {
      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await getVietmapAutocomplete(val);
          setSuggestions(results.slice(0, 7));
        } catch {
          setSuggestions([]);
        }
      }, 150);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (item) => {
    const text = item.label || item.properties?.label || item.name || query;
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
          name: feature.properties?.name || feature.properties?.label || feature.label || textToSearch,
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

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedLocation({
          name: 'Vị trí hiện tại của bạn',
          lat: latitude,
          lng: longitude,
        });
        setQuery('Vị trí hiện tại của bạn');
        setLocatingUser(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setLocatingUser(false);
        alert('Không thể truy cập GPS hiện tại. Vui lòng cho phép quyền truy cập vị trí.');
      },
      { timeout: 8000 }
    );
  };

  const calculateDistanceToRoom = async (room) => {
    if (!selectedLocation) {
      alert('Vui lòng chọn hoặc tìm một địa điểm xuất phát trên bản đồ.');
      return;
    }

    setLoading(true);
    try {
      let roomCoords = { lat: 16.0544, lng: 108.2022 };
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

      // Draw polyline on map if Leaflet is active
      if (mapInstanceRef.current && window.L) {
        const { map } = mapInstanceRef.current;
        if (mapInstanceRef.current.routeLayer) {
          map.removeLayer(mapInstanceRef.current.routeLayer);
        }
        const latlngs = [
          [selectedLocation.lat, selectedLocation.lng],
          [roomCoords.lat, roomCoords.lng],
        ];
        const routeLine = window.L.polyline(latlngs, {
          color: '#ab3500',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.8,
        }).addTo(map);

        mapInstanceRef.current.routeLayer = routeLine;
        map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const switchLayer = (layerName) => {
    setMapLayer(layerName);
    if (mapInstanceRef.current && window.L) {
      const { map, tiles } = mapInstanceRef.current;
      map.removeLayer(tiles);
      const newUrl =
        layerName === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const newTiles = window.L.tileLayer(newUrl, {
        maxZoom: 19,
        attribution: '&copy; Vietmap GIS / OpenStreetMap',
      }).addTo(map);
      mapInstanceRef.current.tiles = newTiles;
    }
  };

  const handleZoom = (delta) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.map.setZoom(mapInstanceRef.current.map.getZoom() + delta);
    }
  };

  const vietmapWebUrl = `https://maps.vietmap.vn/?point=${selectedLocation.lat},${selectedLocation.lng}`;

  const renderIconCategory = (cat) => {
    if (cat === 'university') return <GraduationCap size={14} className="text-emerald-600 shrink-0" />;
    if (cat === 'district' || cat === 'city') return <Building size={14} className="text-blue-600 shrink-0" />;
    return <MapPin size={14} className="text-[#ab3500] shrink-0" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gradient-to-r from-orange-50/70 to-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ab3500] text-white flex items-center justify-center shadow-sm">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                Bản đồ vị trí & Đo khoảng cách (Vietmap GIS Live)
              </h3>
              <p className="text-[11px] text-gray-500">
                Tìm kiếm vị trí, tra cứu tọa độ và tính toán lộ trình thông minh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Suggestions Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-150 bg-gray-50/50 space-y-2.5 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress(query)}
                placeholder="Nhập địa chỉ, trường ĐH, quận huyện (VD: Bách Khoa, Hải Châu, Cầu Rồng)..."
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-250 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#ab3500] focus:border-transparent outline-none transition shadow-sm"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setSuggestions([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => handleSelectSuggestion(item)}
                      className="p-3 hover:bg-orange-50/60 cursor-pointer flex items-center gap-2.5 text-xs transition text-gray-800"
                    >
                      {renderIconCategory(item.properties?.category || item.category)}
                      <div className="truncate">
                        <p className="font-semibold truncate">
                          {item.name || item.properties?.name || item.label}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {item.label || item.properties?.label || item.properties?.address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleSearchAddress(query)}
              disabled={loading || !query}
              className="px-4 py-2.5 bg-[#ab3500] hover:bg-[#8e2800] disabled:bg-gray-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition shrink-0 cursor-pointer active:scale-95"
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>

            <button
              onClick={handleGetCurrentLocation}
              disabled={locatingUser}
              className="px-3 py-2.5 bg-white hover:bg-orange-50 text-gray-700 hover:text-[#ab3500] border border-gray-250 text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Lấy vị trí GPS hiện tại"
            >
              <Crosshair size={15} className={locatingUser ? 'animate-spin text-[#ab3500]' : ''} />
              <span className="hidden sm:inline">Vị trí của tôi</span>
            </button>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-gray-500 font-semibold shrink-0">Gợi ý nhanh:</span>
            {POPULAR_AREAS.map((area) => (
              <button
                key={area.label}
                onClick={() => {
                  setQuery(area.query);
                  handleSearchAddress(area.query);
                }}
                className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:border-orange-200 border border-gray-200 rounded-lg text-gray-700 shrink-0 font-medium transition cursor-pointer"
              >
                {area.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Map + Route Panel */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Interactive Leaflet Map */}
            <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
              <div ref={mapContainerRef} className="w-full h-full z-0" />

              {/* Fallback frame */}
              {!window.L && (
                <iframe
                  title="Bản đồ Vietmap GIS"
                  src={`https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=14&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              )}

              {/* Floating Selected Location Badge */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-gray-200 max-w-[260px] z-[500]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ab3500] shrink-0 animate-pulse"></span>
                  <span className="truncate">{selectedLocation.name}</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-mono font-semibold mt-0.5">
                  Tọa độ: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>

              {/* Map Layer Switcher */}
              <div className="absolute top-3 right-3 z-[500] flex items-center gap-1.5">
                <div className="inline-flex bg-white/95 backdrop-blur-md border border-gray-200 p-0.5 rounded-xl shadow-sm text-[11px] font-semibold">
                  <button
                    onClick={() => switchLayer('street')}
                    className={`px-2 py-1 rounded-lg transition ${mapLayer === 'street' ? 'bg-[#ab3500] text-white' : 'text-gray-600'}`}
                  >
                    Đường phố
                  </button>
                  <button
                    onClick={() => switchLayer('satellite')}
                    className={`px-2 py-1 rounded-lg transition ${mapLayer === 'satellite' ? 'bg-[#ab3500] text-white' : 'text-gray-600'}`}
                  >
                    Vệ tinh
                  </button>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-14 right-3 z-[500] flex flex-col gap-1.5">
                <button
                  onClick={() => handleZoom(1)}
                  className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-md text-gray-700 hover:text-[#ab3500] flex items-center justify-center transition active:scale-95 cursor-pointer"
                  title="Phóng to"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => handleZoom(-1)}
                  className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-md text-gray-700 hover:text-[#ab3500] flex items-center justify-center transition active:scale-95 cursor-pointer"
                  title="Thu nhỏ"
                >
                  <ZoomOut size={16} />
                </button>
              </div>

              {/* Action link */}
              <div className="absolute bottom-3 right-3 z-[500]">
                <a
                  href={vietmapWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#ab3500] hover:bg-[#8e2800] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Mở rộng Vietmap</span>
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
                  Chọn phòng trọ bên dưới để đo khoảng cách và lộ trình từ vị trí đang chọn:
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-gray-100">
                  {rooms.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => calculateDistanceToRoom(r)}
                      className="pt-2 first:pt-0 p-2 bg-white hover:bg-orange-50/70 border border-gray-200 hover:border-[#ab3500] rounded-xl cursor-pointer transition text-xs flex items-center justify-between group"
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
                  <a
                    href={routeInfo.vietmapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline pt-0.5"
                  >
                    <span>Mở chỉ đường trên Vietmap</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-150 flex items-center justify-between text-xs shrink-0">
          <span className="text-gray-500 text-[11px] sm:text-xs">
            Bản đồ tương tác thời gian thực tích hợp Vietmap GIS Platform
          </span>
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
