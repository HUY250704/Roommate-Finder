import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function UserHome() {
  const { users, rooms, favorites } = useStore();
  const navigate = useNavigate();

  // Tab state: 'roommates' | 'rooms'
  const [activeTab, setActiveTab] = useState('roommates');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter drawer / controls state
  const [showFilters, setShowFilters] = useState(false);
  const [maxBudget, setMaxBudget] = useState(10000000);
  const [selectedSmoking, setSelectedSmoking] = useState('All');
  const [selectedPets, setSelectedPets] = useState('All');
  const [selectedCleanliness, setSelectedCleanliness] = useState('All');

  const roommates = users.filter(u => u.role !== 'admin' && u.id !== 'sarah');

  const handleCardClick = (id, type) => {
    if (type === 'roommate') {
      navigate(/roommates/\);
    } else {
      navigate(/rooms/\);
    }
  };

  const filteredRoommates = roommates.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.intro.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.occupation && u.occupation.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSmoking = selectedSmoking === 'All' || (u.smoking && u.smoking.toLowerCase().includes(selectedSmoking.toLowerCase()));
    const matchesPets = selectedPets === 'All' || (u.pets && u.pets.toLowerCase().includes(selectedPets.toLowerCase()));
    return matchesSearch && matchesSmoking && matchesPets;
  });

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBudget = r.price <= maxBudget;
    return matchesSearch && matchesBudget;
  });

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      <main className="flex-grow w-full max-w-7xl mx-auto px-5 md:px-8 py-6 space-y-6">
        
        {/* Search & Filter Header Section */}
        <section className="space-y-4 sticky top-[64px] z-30 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full max-w-xl">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                search
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ab3500]"
                placeholder="Search location, district, keywords..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Custom Toggle Switch & Filter Trigger */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="inline-flex bg-gray-100 rounded-full p-1 select-none border">
                <button
                  onClick={() => setActiveTab('roommates')}
                  className={px-5 py-2 rounded-full text-xs font-bold transition-all \}
                >
                  Roommates
                </button>
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={px-5 py-2 rounded-full text-xs font-bold transition-all \}
                >
                  Rooms
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={px-4 py-2.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-colors \}
              >
                <span className="material-symbols-outlined text-base">tune</span>
                Filters
              </button>
            </div>
          </div>

          {/* Expandable Filter Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
              {activeTab === 'rooms' ? (
                <div className="space-y-1 col-span-3 sm:col-span-1">
                  <div className="flex justify-between font-bold text-gray-700">
                    <span>Max Monthly Budget</span>
                    <span className="text-[#ab3500]">{(maxBudget / 1000000).toFixed(1)}M VND</span>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="15000000"
                    step="500000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-[#ab3500]"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Smoking Habit</label>
                    <select
                      value={selectedSmoking}
                      onChange={(e) => setSelectedSmoking(e.target.value)}
                      className="w-full border rounded-lg p-2 bg-white outline-none focus:ring-1 focus:ring-[#ab3500]"
                    >
                      <option value="All">Any Smoking Preference</option>
                      <option value="No smoking">Non-Smoker Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Pet Policy</label>
                    <select
                      value={selectedPets}
                      onChange={(e) => setSelectedPets(e.target.value)}
                      className="w-full border rounded-lg p-2 bg-white outline-none focus:ring-1 focus:ring-[#ab3500]"
                    >
                      <option value="All">Any Pet Preference</option>
                      <option value="dog">Love Dogs / Pets</option>
                      <option value="No Pets">No Pets</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Feed Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'roommates' ? (
            filteredRoommates.map(roommate => (
              <article
                key={roommate.id}
                onClick={() => handleCardClick(roommate.id, 'roommate')}
                className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col cursor-pointer group hover:scale-[1.02] transition-transform duration-300 border border-gray-150"
              >
                <div className="relative h-64 w-full">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={roommate.name}
                    src={roommate.avatar}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <span className="font-bold text-xs text-[#ab3500]">{roommate.matchScore || 90}% Match</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <h2 className="text-xl font-bold">{roommate.name}, {roommate.age || 24}</h2>
                    <p className="text-xs opacity-90">{roommate.occupation}</p>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-2 bg-white flex-grow">
                  <p className="text-xs text-gray-600 line-clamp-2 min-h-[36px]">
                    {roommate.intro}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[11px] text-gray-700 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[13px]">bedtime</span>
                      {roommate.sleepSchedule || 'Early Bird'}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[11px] text-gray-700 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[13px]">smoke_free</span>
                      {roommate.smoking || 'No smoking'}
                    </span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            filteredRooms.map(room => {
              const isFav = favorites.includes(room.id);
              return (
                <article
                  key={room.id}
                  onClick={() => handleCardClick(room.id, 'room')}
                  className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col cursor-pointer group hover:scale-[1.02] transition-transform duration-300 border border-gray-150"
                >
                  <div className="relative h-64 w-full">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={room.title}
                      src={room.image}
                    />
                    {room.verified && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow font-bold text-[11px]">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        <span>Verified</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <h2 className="text-xl text-white font-bold">
                        {room.price >= 1000000 ? \M : room.price.toLocaleString()} / mo
                      </h2>
                      <p className="text-xs text-white/90 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {room.location}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2 bg-white flex-grow">
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{room.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {room.description}
                    </p>
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
