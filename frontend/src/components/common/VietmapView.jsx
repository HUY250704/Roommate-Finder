import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ExternalLink, Layers, ZoomIn, ZoomOut, Compass, Map, Globe } from 'lucide-react';
import { searchVietmapAddress } from '../../utils/vietmap';

export default function VietmapView({ address, location, title }) {
  const [coordinates, setCoordinates] = useState({ lat: 16.0544, lng: 108.2022 }); // Da Nang default
  const [loading, setLoading] = useState(false);
  const [mapLayer, setMapLayer] = useState('voyager'); // 'voyager' | 'street' | 'satellite'
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const fullAddress = address ? `${address}, ${location || 'Đà Nẵng, Việt Nam'}` : (location || 'Đà Nẵng, Việt Nam');

  useEffect(() => {
    let isMounted = true;
    async function resolveCoords() {
      if (!fullAddress) return;
      setLoading(true);
      try {
        const result = await searchVietmapAddress(fullAddress);
        const feature = result?.data?.features?.[0] || result?.features?.[0];
        if (feature && feature.geometry && isMounted) {
          const [lng, lat] = feature.geometry.coordinates;
          setCoordinates({ lat, lng });
        }
      } catch (err) {
        console.warn('Geocoding failed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    resolveCoords();
    return () => { isMounted = false; };
  }, [fullAddress]);

  const getTileUrl = (layer) => {
    if (layer === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (layer === 'street') {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  };

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (window.L && !mapInstanceRef.current) {
      try {
        const map = window.L.map(mapContainerRef.current, {
          center: [coordinates.lat, coordinates.lng],
          zoom: 15,
          zoomControl: false,
          attributionControl: false,
        });

        const tiles = window.L.tileLayer(getTileUrl(mapLayer), {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        // Elegant custom pin with glowing drop-shadow
        const customIcon = window.L.divIcon({
          className: 'custom-vietmap-pin',
          html: `
            <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 38px; height: 38px; background: rgba(171, 53, 0, 0.2); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 32px; height: 32px; background: linear-gradient(135deg, #ab3500 0%, #e64a19 100%); border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 12px rgba(171, 53, 0, 0.4); display: flex; align-items: center; justify-content: center;">
                <div style="width: 9px; height: 9px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 36],
          popupAnchor: [0, -34],
        });

        const marker = window.L.marker([coordinates.lat, coordinates.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 4px; line-height: 1.4;">
            <b style="color: #ab3500; font-size: 13px; font-weight: 700;">${title || 'Vị trí phòng'}</b>
            <p style="color: #4b5563; margin: 3px 0 0 0; font-size: 11px;">${fullAddress}</p>
          </div>
        `);

        mapInstanceRef.current = { map, tiles, marker };
      } catch (e) {
        console.warn('Leaflet init fallback:', e);
      }
    } else if (mapInstanceRef.current) {
      const { map, marker } = mapInstanceRef.current;
      map.setView([coordinates.lat, coordinates.lng], 15, { animate: true });
      if (marker) {
        marker.setLatLng([coordinates.lat, coordinates.lng]);
        marker.getPopup()?.setContent(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 4px; line-height: 1.4;">
            <b style="color: #ab3500; font-size: 13px; font-weight: 700;">${title || 'Vị trí phòng'}</b>
            <p style="color: #4b5563; margin: 3px 0 0 0; font-size: 11px;">${fullAddress}</p>
          </div>
        `);
      }
    }
  }, [coordinates, title, fullAddress]);

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

  const vietmapWebUrl = `https://maps.vietmap.vn/?point=${coordinates.lat},${coordinates.lng}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4 font-sans transition-all">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ab3500] flex items-center justify-center border border-orange-100/80 shadow-xs">
            <Compass size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-tight flex items-center gap-1.5">
              <span>Bản đồ vị trí phòng trọ</span>
              <span className="text-[10px] font-semibold text-[#ab3500] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/50">
                Vietmap GIS
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 truncate max-w-sm mt-0.5">{fullAddress}</p>
          </div>
        </div>

        {/* Map style segment buttons */}
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-gray-100/80 p-0.5 rounded-xl border border-gray-200/50 text-[11px] font-semibold text-gray-600">
            <button
              onClick={() => switchLayer('voyager')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                mapLayer === 'voyager' ? 'bg-white shadow-xs text-[#ab3500] font-bold' : 'hover:text-gray-900'
              }`}
            >
              <Map size={12} />
              <span>Chuẩn</span>
            </button>
            <button
              onClick={() => switchLayer('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                mapLayer === 'satellite' ? 'bg-white shadow-xs text-[#ab3500] font-bold' : 'hover:text-gray-900'
              }`}
            >
              <Globe size={12} />
              <span>Vệ tinh</span>
            </button>
          </div>

          <a
            href={vietmapWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-gray-600 hover:text-[#ab3500] bg-gray-50 hover:bg-orange-50/80 border border-gray-200/70 hover:border-orange-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            title="Mở toàn màn hình trên Vietmap"
          >
            <span>Vietmap</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Interactive Map Frame */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-gray-200 bg-[#f4f5f7] shadow-inner group">
        {/* Leaflet map DOM */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Fallback iframe */}
        {!window.L && (
          <iframe
            title="Bản đồ vị trí phòng"
            src={`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`}
            className="w-full h-full border-0"
            loading="lazy"
          />
        )}

        {/* Floating Top-Left Card Info */}
        <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-white/80 max-w-[280px] sm:max-w-xs z-[400] transition group-hover:bg-white/95">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ab3500] shrink-0 animate-pulse"></span>
            <p className="text-xs font-bold text-gray-900 truncate">{title || 'Vị trí phòng trọ'}</p>
          </div>
          <p className="text-[11px] text-gray-600 truncate mt-1">{fullAddress}</p>
          <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-100 text-[10px] text-emerald-700 font-mono font-medium">
            <span>Tọa độ: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
          </div>
        </div>

        {/* Zoom Controls on Top-Right */}
        <div className="absolute top-3.5 right-3.5 z-[400] flex flex-col gap-1.5">
          <button
            onClick={() => handleZoom(1)}
            className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-md hover:bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-[#ab3500] flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-md hover:bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-[#ab3500] flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut size={15} />
          </button>
        </div>

        {/* Action Buttons on Bottom-Right */}
        <div className="absolute bottom-3.5 right-3.5 z-[400] flex items-center gap-2">
          <a
            href={vietmapWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-gradient-to-r from-[#ab3500] to-[#c64402] hover:from-[#902c00] hover:to-[#ab3500] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Navigation size={13} />
            <span>Chỉ đường trực tiếp</span>
          </a>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-xl border border-gray-200 shadow-sm transition-all flex items-center justify-center cursor-pointer"
            title="Mở trên Google Maps"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
