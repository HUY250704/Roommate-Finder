import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ExternalLink, Layers, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { searchVietmapAddress } from '../../utils/vietmap';

export default function VietmapView({ address, location, title }) {
  const [coordinates, setCoordinates] = useState({ lat: 16.0544, lng: 108.2022 }); // Da Nang default
  const [loading, setLoading] = useState(false);
  const [mapLayer, setMapLayer] = useState('street'); // 'street' | 'satellite' | 'voyager'
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

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

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (window.L && !mapInstanceRef.current) {
      try {
        const map = window.L.map(mapContainerRef.current, {
          center: [coordinates.lat, coordinates.lng],
          zoom: 15,
          zoomControl: false,
        });

        // Crisp tile layer (CartoDB Voyager or OpenStreetMap)
        const tileUrl =
          mapLayer === 'satellite'
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : mapLayer === 'voyager'
            ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const tiles = window.L.tileLayer(tileUrl, {
          maxZoom: 19,
          attribution: '&copy; Vietmap GIS / OpenStreetMap',
        }).addTo(map);

        // Custom pulsing marker
        const customIcon = window.L.divIcon({
          className: 'custom-vietmap-pin',
          html: `<div style="
            width: 34px; height: 34px;
            background: #ab3500;
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 14px rgba(171, 53, 0, 0.45);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="
              width: 10px; height: 10px;
              background: #ffffff;
              border-radius: 50%;
              transform: rotate(45deg);
              display: block;
            "></span>
          </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -32],
        });

        const marker = window.L.marker([coordinates.lat, coordinates.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <b style="color: #ab3500; font-size: 13px;">${title || 'Vị trí phòng trọ'}</b><br/>
            <span style="color: #4b5563;">${fullAddress}</span>
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
          <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <b style="color: #ab3500; font-size: 13px;">${title || 'Vị trí phòng trọ'}</b><br/>
            <span style="color: #4b5563;">${fullAddress}</span>
          </div>
        `);
      }
    }

    return () => {
      // Keep instance intact across minor renders
    };
  }, [coordinates, mapLayer, title, fullAddress]);

  // Change Layer Tile
  const switchLayer = (layerName) => {
    setMapLayer(layerName);
    if (mapInstanceRef.current && window.L) {
      const { map, tiles } = mapInstanceRef.current;
      map.removeLayer(tiles);
      const newUrl =
        layerName === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : layerName === 'voyager'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
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

  const vietmapWebUrl = `https://maps.vietmap.vn/?point=${coordinates.lat},${coordinates.lng}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-3 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <span className="material-symbols-outlined text-[#ab3500] text-[20px]">location_on</span>
          <span>Bản đồ vị trí phòng trọ (Vietmap GIS Live)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer switcher */}
          <div className="inline-flex bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold">
            <button
              onClick={() => switchLayer('street')}
              className={`px-2 py-1 rounded-md transition ${mapLayer === 'street' ? 'bg-white shadow text-[#ab3500] font-bold' : 'text-gray-600'}`}
            >
              Đường phố
            </button>
            <button
              onClick={() => switchLayer('satellite')}
              className={`px-2 py-1 rounded-md transition ${mapLayer === 'satellite' ? 'bg-white shadow text-[#ab3500] font-bold' : 'text-gray-600'}`}
            >
              Vệ tinh
            </button>
          </div>

          <a
            href={vietmapWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#ab3500] hover:underline flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg"
          >
            <span>Vietmap</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Direct Interactive Map Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
        {/* Leaflet Map DOM Target */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Fallback Iframe if Leaflet fails */}
        {!window.L && (
          <iframe
            title="Bản đồ vị trí phòng trọ"
            src={`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`}
            className="w-full h-full border-0"
            loading="lazy"
          />
        )}

        {/* Floating Room Info Overlay on Top-Left */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-gray-200 max-w-xs z-[500]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ab3500] shrink-0 animate-pulse"></span>
            <span className="truncate">{title || 'Vị trí phòng'}</span>
          </div>
          <p className="text-[11px] text-gray-600 truncate mt-0.5">{fullAddress}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-700 font-mono font-semibold">
            <span>Tọa độ: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
          </div>
        </div>

        {/* Custom Map Controls (Zoom In/Out) */}
        <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1.5">
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

        {/* Direct Navigation Button overlay on Bottom-Right */}
        <div className="absolute bottom-3 right-3 z-[500] flex items-center gap-2">
          <a
            href={vietmapWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#ab3500] hover:bg-[#8e2800] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Navigation size={14} />
            <span>Chỉ đường Vietmap</span>
          </a>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-white/90 hover:bg-white text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 shadow-md transition-all flex items-center gap-1 cursor-pointer"
            title="Mở Google Maps"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
