import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { searchVietmapAddress } from '../../utils/vietmap';

export default function VietmapView({ address, location, title }) {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiKey = import.meta.env.VITE_VIETMAP_API_KEY || '';

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

  const vietmapWebUrl = coordinates 
    ? `https://maps.vietmap.vn/?point=${coordinates.lat},${coordinates.lng}`
    : `https://maps.vietmap.vn/?q=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
          <span className="material-symbols-outlined text-[#ab3500]">location_on</span>
          <span>Bản đồ vị trí (Vietmap GIS)</span>
        </div>
        <a 
          href={vietmapWebUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-[#ab3500] hover:underline flex items-center gap-1 font-semibold"
        >
          <span>Mở trên Vietmap</span>
          <ExternalLink size={13} />
        </a>
      </div>

      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
        {/* Interactive / Static Map representation */}
        <div className="absolute inset-0 bg-[#e8ecef] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-2 border border-red-100 animate-bounce">
            <MapPin className="text-[#ab3500]" size={26} />
          </div>
          <p className="text-xs font-bold text-gray-800 line-clamp-1 max-w-sm">{title || 'Vị trí phòng trọ'}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 max-w-md">{fullAddress}</p>
          {coordinates && (
            <span className="text-[10px] text-emerald-700 font-mono mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
            </span>
          )}
        </div>

        {/* Action badge */}
        <div className="absolute bottom-2 right-2">
          <a
            href={vietmapWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#ab3500] text-white text-xs font-semibold rounded-lg shadow hover:bg-[#8e2800] transition flex items-center gap-1.5"
          >
            <Navigation size={13} />
            <span>Chỉ đường</span>
          </a>
        </div>
      </div>
    </div>
  );
}
