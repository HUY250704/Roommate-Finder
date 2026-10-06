import React, { useEffect, useRef, useState } from 'react';
import { getRoomMapMarkers } from '../../utils/vietmap';

export default function RoomMap({ language }) {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('token');

    if (!token) {
      setError(language === 'vi' ? 'Vui lòng đăng nhập để xem bản đồ phòng.' : 'Sign in to view room map markers.');
      setLoading(false);
      return () => { active = false; };
    }

    getRoomMapMarkers()
      .then((mapRooms) => {
        if (active) setRooms(mapRooms);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [language]);

  useEffect(() => {
    if (!mapContainerRef.current || !window.L || !rooms.length) return undefined;

    const map = window.L.map(mapContainerRef.current, {
      center: [16.0544, 108.2022],
      zoom: 12,
      scrollWheelZoom: false,
    });
    window.L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri; Sources: Esri, TomTom, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors',
      }
    ).addTo(map);

    const markers = rooms.flatMap((room) => {
      const point = room.coordinates?.coordinates;
      if (!Array.isArray(point) || point.length !== 2) return [];
      const [lng, lat] = point;
      const marker = window.L.circleMarker([lat, lng], {
        radius: 9,
        color: '#ffffff',
        weight: 2,
        fillColor: '#ab3500',
        fillOpacity: 1,
      }).addTo(map);
      const popup = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = room.title;
      const price = document.createElement('p');
      price.textContent = `${Number(room.price).toLocaleString()} VND / mo`;
      popup.append(title, price);
      marker.bindPopup(popup);
      return [marker];
    });

    if (markers.length === 1) {
      map.setView(markers[0].getLatLng(), 14);
    } else if (markers.length > 1) {
      map.fitBounds(window.L.featureGroup(markers).getBounds(), { padding: [24, 24] });
    }
    return () => {
      map.remove();
    };
  }, [rooms]);

  if (loading) {
    return <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-600">Loading room map…</div>;
  }

  if (error) {
    return <div role="alert" className="rounded-xl border bg-white p-8 text-center text-sm text-red-700">{error}</div>;
  }

  if (!rooms.length) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-600">
        {language === 'vi' ? 'Chưa có phòng nào được đăng tọa độ để hiển thị.' : 'No room listings with coordinates yet.'}
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      role="region"
      aria-label={language === 'vi' ? 'Bản đồ phòng trọ' : 'Room listings map'}
      className="h-[32rem] w-full rounded-xl border border-gray-200 bg-gray-100"
    />
  );
}
