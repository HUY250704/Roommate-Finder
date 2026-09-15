import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { searchVietmapAddress } from '../../utils/vietmap';

export default function VietmapView({ address, location, title }) {
  const [coordinates, setCoordinates] = useState({ lat: 16.0544, lng: 108.2022 }); // default Da Nang center
  const [loading, setLoading] = useState(false);

  const fullAddress = address ? `${address}, ${location || 'Da Nang, Vietnam'}` : (location || 'Da Nang, Vietnam');

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
        console.warn('Geocoding with Vietmap failed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    resolveCoords();
    return () => { isMounted = false; };
  }, [fullAddress]);

  const vietmapWebUrl = `https://maps.vietmap.vn/?point=${coordinates.lat},${coordinates.lng}`;
  // Direct interactive OpenStreetMap / Vietmap live embed view
  const embedMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.008}%2C${coordinates.lat - 0.006}%2C${coordinates.lng + 0.008}%2C${coordinates.lat + 0.006}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <span className="material-symbols-outlined text-[#ab3500]">location_on</span>
          <span>Bản đồ vị trí phòng trọ (Vietmap GIS Live)</span>
        </div>

        <a
          href={vietmapWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#ab3500] hover:underline flex items-center gap-1"
        >
          <span>Mở rộng trên Vietmap</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Direct Interactive Map Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
        {/* Live Map Iframe */}
        <iframe
          title="Bản đồ vị trí phòng trọ"
          src={embedMapUrl}
          className="w-full h-full border-0"
          loading="lazy"
          scrolling="no"
        />

        {/* Floating Room Info Overlay on Top-Left */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-gray-200 max-w-xs z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 truncate">
            <span className="w-2 h-2 rounded-full bg-[#ab3500] shrink-0"></span>
            <span className="truncate">{title || 'Vị trí phòng'}</span>
          </div>
          <p className="text-[11px] text-gray-600 truncate mt-0.5">{fullAddress}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-700 font-mono font-semibold">
            <span>Tọa độ: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
          </div>
        </div>

        {/* Direct Navigation Button overlay on Bottom-Right */}
        <div className="absolute bottom-3 right-3 z-10">
          <a
            href={vietmapWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#ab3500] hover:bg-[#8e2800] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Navigation size={14} />
            <span>Chỉ đường trực tiếp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
