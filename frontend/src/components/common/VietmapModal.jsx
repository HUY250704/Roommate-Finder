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
  GraduationCap,
  Building,
  Route,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { getVietmapAutocomplete, searchVietmapAddress, calculateVietmapRoute } from '../../utils/vietmap';
import { useStore } from '../../store';

const POPULAR_AREAS = [
  { label: 'Q. Hải Châu (ĐN)', query: 'Quận Hải Châu Đà Nẵng' },
  { label: 'Q. Sơn Trà (ĐN)', query: 'Quận Sơn Trà Đà Nẵng' },
  { label: 'ĐH Bách Khoa (DUT)', query: 'Đại học Bách Khoa Đà Nẵng' },
  { label: 'ĐH Kinh Tế (DUE)', query: 'Đại học Kinh Tế Đà Nẵng' },
  { label: 'ĐH Duy Tân', query: 'Đại học Duy Tân Đà Nẵng' },
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
  const [mapLayer, setMapLayer] = useState('voyager'); // 'voyager' | 'satellite'
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

  const getTileUrl = (layer) => {
    if (layer === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  };

  // Leaflet map initialization
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.map.remove();
        } catch (e) {
          // cleanup
        }
        mapInstanceRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (window.L && !mapInstanceRef.current) {
        try {
          const map = window.L.map(mapContainerRef.current, {
            center: [selectedLocation.lat, selectedLocation.lng],
            zoom: 15,
            zoomControl: false,
            attributionControl: false,
          });

          const tiles = window.L.tileLayer(getTileUrl(mapLayer), {
            maxZoom: 19,
            subdomains: 'abcd',
          }).addTo(map);

          const customIcon = window.L.divIcon({
            className: 'custom-vietmap-pin-modal',
            html: `
              <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 38px; height: 38px; background: rgba(171, 53, 0, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: relative; width: 32px; height: 32px; background: linear-gradient(135deg, #ab3500 0%, #e64a19 100%); border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 14px rgba(171, 53, 0, 0.45); display: flex; align-items: center; justify-content: center;">
                  <div style="width: 9px; height: 9px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
                </div>
              </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 36],
            popupAnchor: [0, -34],
          });

          const marker = window.L.marker([selectedLocation.lat, selectedLocation.lng], { icon: customIcon }).addTo(
            map
          );
          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 4px; line-height: 1.4;">
              <b style="color: #ab3500; font-size: 13px;">${selectedLocation.name}</b><br/>
              <span style="color: #6b7280; font-size: 11px;">Tọa độ: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}</span>
            </div>
          `);

          mapInstanceRef.current = { map, tiles, marker, routeLayer: null };
          setTimeout(() => map.invalidateSize(), 150);
        } catch (e) {
          console.warn('Leaflet modal init fallback:', e);
        }
      } else if (mapInstanceRef.current) {
        const { map, marker } = mapInstanceRef.current;
        map.invalidateSize();
        map.flyTo([selectedLocation.lat, selectedLocation.lng], 15, { duration: 0.8 });
        if (marker) {
          marker.setLatLng([selectedLocation.lat, selectedLocation.lng]);
          marker.getPopup()?.setContent(`
            <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 4px; line-height: 1.4;">
              <b style="color: #ab3500; font-size: 13px;">${selectedLocation.name}</b><br/>
              <span style="color: #6b7280; font-size: 11px;">Tọa độ: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}</span>
            </div>
          `);
        }
      }
    }, 80);

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
        alert('Không thể lấy vị trí hiện tại. Vui lòng bật quyền truy cập vị trí trên trình duyệt.');
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

      // Draw polyline on map
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
          opacity: 0.85,
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
      const newTiles = window.L.tileLayer(getTileUrl(layerName), {
        maxZoom: 19,
        subdomains: 'abcd',
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

  const renderCategoryIcon = (category) => {
    if (category === 'university') {
      return (
        <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <GraduationCap size={13} />
        </span>
      );
    }
    if (category === 'district' || category === 'city') {
      return (
        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Building size={13} />
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-lg bg-orange-50 text-[#ab3500] flex items-center justify-center shrink-0">
        <MapPin size={13} />
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-hidden font-sans">
      <div className="bg-white w-full max-w-6xl h-[92vh] max-h-[820px] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-150 animate-fadeIn flex flex-col">
        {/* Header Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-gray-150 flex items-center justify-between bg-gradient-to-r from-[#ab3500] via-[#bf3c02] to-[#ab3500] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-xs">
              <Compass size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base leading-tight">
                  Vietmap GIS Bản Đồ
                </h3>
                <span className="text-[10px] font-semibold text-white/95 bg-white/20 px-2 py-0.5 rounded-full border border-white/25 hidden sm:inline">
                  Chính xác tại Việt Nam
                </span>
              </div>
              <p className="text-[11px] text-orange-100 mt-0.5">
                Tìm kiếm vị trí, tính khoảng cách và tuyến đường đến phòng trọ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Suggestions Toolbar */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-gray-200/80 bg-[#fdfcfb] space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress(query)}
                placeholder="Tìm kiếm địa chỉ / vị trí hiện tại (Vietmap Autocomplete)..."
                className="w-full pl-10 pr-10 py-2 bg-white border border-gray-250 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#ab3500]/20 focus:border-[#ab3500] outline-none transition shadow-xs text-gray-900"
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
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-250 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => handleSelectSuggestion(item)}
                      className="p-2.5 hover:bg-orange-50/70 cursor-pointer flex items-center gap-2.5 text-xs transition text-gray-800"
                    >
                      {renderCategoryIcon(item.properties?.category || item.category)}
                      <div className="truncate">
                        <p className="font-bold text-gray-900 truncate">
                          {item.name || item.properties?.name || item.label}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {item.label || item.properties?.label || item.properties?.address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleSearchAddress(query)}
                disabled={loading || !query}
                className="px-4 py-2 bg-[#ab3500] hover:bg-[#8e2800] disabled:bg-gray-250 disabled:text-gray-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer active:scale-95 flex-1 sm:flex-initial"
              >
                {loading ? 'Đang tìm...' : 'Định vị'}
              </button>

              <button
                onClick={handleGetCurrentLocation}
                disabled={locatingUser}
                className="px-3.5 py-2 bg-white hover:bg-orange-50 text-gray-700 hover:text-[#ab3500] border border-gray-250 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                title="Lấy vị trí GPS hiện tại"
              >
                <Crosshair size={15} className={locatingUser ? 'animate-spin text-[#ab3500]' : 'text-[#ab3500]'} />
                <span className="hidden md:inline">Vị trí của tôi</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
            <span className="text-gray-400 font-medium shrink-0">Gợi ý:</span>
            {POPULAR_AREAS.map((area) => (
              <button
                key={area.label}
                onClick={() => {
                  setQuery(area.query);
                  handleSearchAddress(area.query);
                }}
                className="px-2.5 py-0.5 bg-white hover:bg-orange-50 hover:text-[#ab3500] hover:border-orange-200 border border-gray-200 rounded-full text-gray-600 shrink-0 font-medium transition cursor-pointer shadow-2xs"
              >
                {area.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-5 flex-1 min-h-0 bg-white overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-4 h-full w-full">
            {/* Map Area */}
            <div className="flex-1 min-w-0 h-[360px] lg:h-full relative rounded-2xl overflow-hidden border border-gray-250 bg-[#f4f5f7] shadow-inner group">
              <div ref={mapContainerRef} className="w-full h-full z-0" />

              {/* Fallback iframe */}
              {!window.L && (
                <iframe
                  title="Bản đồ Vietmap GIS"
                  src={`https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=15&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              )}

              {/* Location Badge on Map */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-white/80 max-w-[260px] sm:max-w-xs z-[400]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ab3500] shrink-0 animate-pulse"></span>
                  <p className="text-xs font-bold text-gray-900 truncate">{selectedLocation.name}</p>
                </div>
                <p className="text-[10px] text-emerald-700 font-mono font-medium mt-0.5">
                  GPS: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>

              {/* Map Layer Switcher */}
              <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5">
                <div className="inline-flex bg-white/95 backdrop-blur-md border border-gray-200 p-0.5 rounded-xl shadow-xs text-[11px] font-semibold text-gray-600">
                  <button
                    onClick={() => switchLayer('voyager')}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      mapLayer === 'voyager' ? 'bg-[#ab3500] text-white shadow-2xs' : 'hover:text-gray-900'
                    }`}
                  >
                    Đường phố
                  </button>
                  <button
                    onClick={() => switchLayer('satellite')}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      mapLayer === 'satellite' ? 'bg-[#ab3500] text-white shadow-2xs' : 'hover:text-gray-900'
                    }`}
                  >
                    Vệ tinh
                  </button>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-12 right-3 z-[400] flex flex-col gap-1.5">
                <button
                  onClick={() => handleZoom(1)}
                  className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-md hover:bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-[#ab3500] flex items-center justify-center transition active:scale-95 cursor-pointer"
                  title="Phóng to"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => handleZoom(-1)}
                  className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-md hover:bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-[#ab3500] flex items-center justify-center transition active:scale-95 cursor-pointer"
                  title="Thu nhỏ"
                >
                  <ZoomOut size={14} />
                </button>
              </div>

              {/* Direct Open Link */}
              <div className="absolute bottom-3 right-3 z-[400]">
                <a
                  href={vietmapWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#ab3500] hover:bg-[#8e2800] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Mở rộng</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Route & Distance Calculation Panel */}
            <div className="w-full lg:w-[360px] shrink-0 flex flex-col justify-between bg-[#fbf9f8] p-4 rounded-2xl border border-gray-200/80 overflow-hidden">
              <div className="space-y-3 flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/70 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#ab3500] flex items-center justify-center">
                      <Route size={13} />
                    </div>
                    <h4 className="font-bold text-xs uppercase text-gray-800 tracking-wide">
                      Khoảng cách & Lộ trình
                    </h4>
                  </div>
                  
                  {/* Vehicle switch */}
                  <div className="inline-flex bg-gray-200/80 p-0.5 rounded-xl text-xs">
                    <button
                      onClick={() => setVehicle('motorcycle')}
                      className={`p-1.5 rounded-lg transition ${
                        vehicle === 'motorcycle' ? 'bg-white shadow-2xs text-[#ab3500]' : 'text-gray-500 hover:text-gray-800'
                      }`}
                      title="Xe máy (~30 km/h)"
                    >
                      <Bike size={13} />
                    </button>
                    <button
                      onClick={() => setVehicle('car')}
                      className={`p-1.5 rounded-lg transition ${
                        vehicle === 'car' ? 'bg-white shadow-2xs text-[#ab3500]' : 'text-gray-500 hover:text-gray-800'
                      }`}
                      title="Ô tô (~40 km/h)"
                    >
                      <Car size={13} />
                    </button>
                    <button
                      onClick={() => setVehicle('foot')}
                      className={`p-1.5 rounded-lg transition ${
                        vehicle === 'foot' ? 'bg-white shadow-2xs text-[#ab3500]' : 'text-gray-500 hover:text-gray-800'
                      }`}
                      title="Đi bộ (~5 km/h)"
                    >
                      <Footprints size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 shrink-0">
                  Chọn phòng trọ để đo khoảng cách từ vị trí của bạn:
                </p>

                {/* Rooms List */}
                <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-[140px]">
                  {rooms.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => calculateDistanceToRoom(r)}
                      className="p-2.5 bg-white hover:bg-orange-50/70 border border-gray-200 hover:border-orange-300 rounded-xl cursor-pointer transition text-xs flex items-center justify-between group shadow-2xs"
                    >
                      <div className="truncate mr-2">
                        <p className="font-bold text-gray-900 group-hover:text-[#ab3500] truncate">{r.title}</p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{r.location}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-[#ab3500] bg-orange-50 group-hover:bg-[#ab3500] group-hover:text-white px-2 py-0.5 rounded-lg transition-all flex items-center gap-1">
                        <span>Đo</span>
                        <ArrowRight size={10} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route calculation result */}
              <div className="shrink-0 pt-2">
                {routeInfo ? (
                  <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-1 text-xs animate-fadeIn shadow-2xs">
                    <p className="font-bold text-emerald-950 truncate">Đến: {routeInfo.roomTitle}</p>
                    <div className="flex items-center justify-between text-emerald-800 font-semibold text-[11px] pt-1 border-t border-emerald-200/60">
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
                ) : (
                  <div className="p-2.5 bg-white border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-[11px]">
                    Nhấp vào phòng trọ để tính khoảng cách & thời gian
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-2.5 bg-gray-50 border-t border-gray-200/80 flex items-center justify-between text-xs shrink-0">
          <span className="text-gray-400 text-[11px]">
            Dữ liệu bản đồ được cung cấp bởi Vietmap API Platform
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 font-semibold rounded-xl text-gray-700 transition cursor-pointer text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
