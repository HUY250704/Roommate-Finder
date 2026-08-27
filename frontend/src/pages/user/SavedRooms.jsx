import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { Heart, MapPin, Home } from 'lucide-react';

export default function SavedRooms() {
  const { rooms, favorites, toggleFavorite } = useStore();
  const savedRooms = rooms.filter(r => favorites.includes(r.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Saved Rooms</h1>
      <p className="text-gray-500 mb-8">View rooms you marked as favorite.</p>

      {savedRooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No rooms saved yet.</p>
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Explore Rooms
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRooms.map(room => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="relative h-48 bg-gray-100">
                <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => toggleFavorite(room.id)}
                  className="absolute top-3 right-3 p-2 rounded-full shadow-md bg-red-50 text-red-600"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
                <span className="absolute bottom-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                  {room.type}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
                  <Link to={`/rooms/${room.id}`} className="hover:text-blue-600">{room.title}</Link>
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{room.location}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-lg font-bold text-blue-600">
                    {room.price.toLocaleString()} VND<span className="text-xs font-normal text-gray-500">/mo</span>
                  </div>
                  <Link
                    to={`/rooms/${room.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}