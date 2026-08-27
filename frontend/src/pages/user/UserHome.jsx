import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function UserHome() {
  const { users, rooms, favorites, toggleFavorite } = useStore();
  const navigate = useNavigate();

  // Tab state: 'roommates' | 'rooms'
  const [activeTab, setActiveTab] = useState('roommates');
  const [searchQuery, setSearchQuery] = useState('');

  const roommates = users.filter(u => u.role !== 'admin' && u.id !== 'sarah'); // filter out admin and self (Sarah)

  const handleCardClick = (id, type) => {
    if (type === 'roommate') {
      navigate(`/roommates/${id}`);
    } else {
      navigate(`/rooms/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      <main className="flex-grow w-full max-w-7xl mx-auto px-5 md:px-8 py-6 space-y-6">
        
        {/* Search & Toggle Section */}
        <section className="space-y-4 sticky top-[64px] z-30 bg-transparent backdrop-blur-sm py-4 -mx-5 px-5 md:mx-0 md:px-0">
          <div className="relative w-full max-w-2xl mx-auto">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#594139]">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-3 rounded-full border border-[#e1e3e4] bg-white font-body-md text-[16px] text-[#191c1d] focus:outline-none input-focus-ring placeholder:text-[#594139] transition-shadow"
              placeholder="Search neighborhoods or universities..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Custom Toggle Switch */}
          <div className="flex justify-center">
            <div className="inline-flex bg-[#e7e8e9] rounded-full p-1 relative select-none">
              <button
                onClick={() => setActiveTab('roommates')}
                className={`relative z-10 px-6 py-2 rounded-full font-label-md text-[14px] font-semibold w-32 text-center transition-colors ${
                  activeTab === 'roommates' ? 'bg-white text-[#ab3500] shadow-sm' : 'text-[#594139] hover:text-[#191c1d]'
                }`}
              >
                Roommates
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`relative z-10 px-6 py-2 rounded-full font-label-md text-[14px] font-semibold w-32 text-center transition-colors ${
                  activeTab === 'rooms' ? 'bg-white text-[#ab3500] shadow-sm' : 'text-[#594139] hover:text-[#191c1d]'
                }`}
              >
                Rooms
              </button>
            </div>
          </div>
        </section>

        {/* Feed Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'roommates' ? (
            roommates
              .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.intro.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(roommate => (
                <article
                  key={roommate.id}
                  onClick={() => handleCardClick(roommate.id, 'roommate')}
                  className="bg-white rounded-xl shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col cursor-pointer group hover:scale-[1.02] transition-transform duration-300 border border-gray-100"
                >
                  <div className="relative h-64 w-full">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={roommate.name}
                      src={roommate.avatar}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                        <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></path>
                          <path
                            className="text-[#ab3500]"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeDasharray={`${roommate.matchScore || 90}, 100`}
                            strokeWidth="4"
                          ></path>
                        </svg>
                      </div>
                      <span className="font-label-sm text-[12px] text-[#ab3500] font-bold">
                        {roommate.matchScore || 90}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-1 flex-grow">
                    <div>
                      <h2 className="font-headline-sm text-[20px] text-[#191c1d] font-bold flex items-center gap-1">
                        {roommate.name}, {roommate.age || 24}
                        {roommate.id === 'minh' && (
                          <span className="material-symbols-outlined text-blue-600 text-lg" title="Verified Profile">
                            verified
                          </span>
                        )}
                      </h2>
                      <p className="font-body-md text-[14px] text-[#594139] flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {roommate.id === 'minh' ? 'Hai Chau District, Da Nang' : 'Westside'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="bg-[#e7e8e9] px-2 py-1 rounded-full font-label-sm text-[12px] text-[#00696b] flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[14px]">
                          {roommate.id === 'minh' ? 'cleaning_services' : 'nightlight'}
                        </span>
                        {roommate.id === 'minh' ? 'High Standard' : 'Night Owl'}
                      </span>
                      <span className="bg-[#e7e8e9] px-2 py-1 rounded-full font-label-sm text-[12px] text-[#00696b] flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[14px]">
                          {roommate.id === 'minh' ? 'pets' : 'work'}
                        </span>
                        {roommate.id === 'minh' ? 'Love dogs' : 'WFH Often'}
                      </span>
                      <span className="bg-[#e7e8e9] px-2 py-1 rounded-full font-label-sm text-[12px] text-[#594139] flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[14px]">smoke_free</span>
                        No Smoking
                      </span>
                    </div>
                  </div>
                </article>
              ))
          ) : (
            rooms
              .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.location.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(room => {
                const isFav = favorites.includes(room.id);
                return (
                  <article
                    key={room.id}
                    onClick={() => handleCardClick(room.id, 'room')}
                    className="bg-white rounded-xl shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col cursor-pointer group hover:scale-[1.02] transition-transform duration-300 border border-gray-100"
                  >
                    <div className="relative h-64 w-full">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={room.title}
                        src={room.image}
                      />
                      {room.verified && (
                        <div className="absolute top-4 right-4 bg-[#d4e3ff] text-[#001c39] px-3 py-1 rounded-full flex items-center gap-1 shadow-sm font-bold text-[12px]">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          <span>Verified</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <h2 className="font-headline-sm text-[20px] text-white font-bold">
                          {room.price >= 1000000 ? `${(room.price / 1000000).toFixed(1)}M` : room.price.toLocaleString()} / mo
                        </h2>
                        <p className="font-body-md text-[14px] text-white/90 flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          {room.location}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2 bg-white flex-grow">
                      <p className="font-body-md text-[14px] text-[#191c1d] line-clamp-2 min-h-[40px]">
                        {room.description}
                      </p>
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 text-gray-500">
                        <div className="flex items-center gap-1" title="Furnished">
                          <span className="material-symbols-outlined text-[20px]">chair</span>
                        </div>
                        <div className="flex items-center gap-1" title="Wifi Included">
                          <span className="material-symbols-outlined text-[20px]">wifi</span>
                        </div>
                        <div className="flex items-center gap-1" title="Washer/Dryer">
                          <span className="material-symbols-outlined text-[20px]">local_laundry_service</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
          )}
        </section>
      </main>
    </div>
  );
}