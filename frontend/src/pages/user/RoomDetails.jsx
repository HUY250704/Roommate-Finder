import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, users, scheduleViewing } = useStore();

  const roomId = id || 'haichau';
  const room = rooms.find(r => r.id === roomId) || rooms[0];
  const owner = users.find(u => u.id === room.ownerId) || users[0];

  const [favorites, setFavorites] = useState(['haichau']);
  const [scheduled, setScheduled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const isFav = favorites.includes(room.id);
  const toggleFav = () => {
    if (isFav) {
      setFavorites(favorites.filter(i => i !== room.id));
    } else {
      setFavorites([...favorites, room.id]);
    }
  };

  const handleRequestViewing = (e) => {
    e.preventDefault();
    scheduleViewing({
      roomId: room.id,
      userId: 'sarah',
      date,
      time
    });
    setScheduled(true);
    setShowModal(false);
    alert('Viewing request submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 font-sans relative">
      {/* Mobile Header Nav */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md px-5 py-4 flex items-center justify-between shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border-b">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={toggleFav}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
          >
            <span className={`material-symbols-outlined ${isFav ? 'text-[#ab3500] fill-current' : 'text-gray-500'}`}>
              {isFav ? 'favorite' : 'favorite_border'}
            </span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-gray-500">share</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:mt-8 md:grid md:grid-cols-12 md:gap-6">
        
        {/* Left Column: Gallery & Main Info */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Gallery Bento Grid on Desktop */}
          <section className="relative">
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <img
                className="col-span-3 row-span-2 object-cover w-full h-full hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
                alt="Main"
                src={room.gallery?.[0] || room.image}
              />
              <img
                className="col-span-1 row-span-1 object-cover w-full h-full hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
                alt="Detail 1"
                src={room.gallery?.[1] || room.image}
              />
              <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
                <img
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  alt="Detail 2"
                  src={room.gallery?.[2] || room.image}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
                  <span className="text-white font-label-md text-[14px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined">photo_library</span>
                    +5 Photos
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Gallery (Horizontal Scroll) */}
            <div className="md:hidden -mx-5 flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
              {(room.gallery || [room.image]).map((img, idx) => (
                <img
                  key={idx}
                  className="w-full h-72 object-cover snap-center flex-shrink-0"
                  alt={`Slide ${idx}`}
                  src={img}
                />
              ))}
            </div>
          </section>

          {/* Main Info Section */}
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150 space-y-4">
            <div className="flex gap-2">
              {room.verified && (
                <div className="bg-[#d4e3ff] text-[#001c39] px-3 py-1 rounded-full flex items-center gap-1 font-bold text-[12px]">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Verified</span>
                </div>
              )}
              <div className="bg-[#00696b]/10 text-[#00696b] px-3 py-1 rounded-full font-bold text-[12px]">
                Available Now
              </div>
            </div>

            <h1 className="font-display-lg text-[26px] md:text-[32px] font-bold text-[#191c1d] leading-snug">
              {room.title}
            </h1>

            <div className="flex items-center gap-1 text-[#594139] text-[15px]">
              <span className="material-symbols-outlined text-gray-400">location_on</span>
              <span>{room.location}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 text-center">
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-gray-400 text-2xl">square_foot</span>
                <span className="font-label-md text-[14px] text-[#191c1d] font-semibold mt-1">{room.size || 25} m2</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-gray-400 text-2xl">bed</span>
                <span className="font-label-md text-[14px] text-[#191c1d] font-semibold mt-1">{room.beds || 1} Bedroom</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-gray-400 text-2xl">shower</span>
                <span className="font-label-md text-[14px] text-[#191c1d] font-semibold mt-1">{room.baths || 2} Baths</span>
              </div>
            </div>

            <div>
              <h3 className="font-headline-sm text-[20px] text-[#191c1d] font-bold mb-2">About this room</h3>
              <p className="text-[#594139] text-[15px] leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="font-headline-sm text-[20px] text-[#191c1d] font-bold mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {(room.amenities || []).map(amenity => (
                  <div key={amenity.name} className="flex items-center gap-2 text-[#594139] text-[15px]">
                    <span className="material-symbols-outlined text-gray-400">{amenity.icon}</span>
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="font-headline-sm text-[20px] text-[#191c1d] font-bold mb-3">House Rules</h3>
              <div className="grid grid-cols-2 gap-3">
                {(room.rules || []).map(rule => (
                  <div key={rule.name} className="flex items-center gap-2 text-[#594139] text-[15px]">
                    <span className="material-symbols-outlined text-gray-400">{rule.icon}</span>
                    <span>{rule.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action Card (Desktop Only) */}
        <div className="hidden md:block md:col-span-4">
          <div className="sticky top-24 bg-white rounded-xl p-6 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150 flex flex-col gap-6">
            <div className="flex items-end gap-2 border-b border-gray-100 pb-4">
              <span className="font-display-lg text-[32px] font-bold text-[#ab3500]">
                {room.price >= 1000000 ? `${(room.price / 1000000).toFixed(1)}M` : room.price.toLocaleString()} VND
              </span>
              <span className="font-body-md text-[16px] text-[#594139] pb-2">/ month</span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-[#ab3500] hover:bg-[#ab3500]/95 text-white font-label-md text-[15px] font-semibold py-4 rounded-full shadow-[0_8px_24px_0px_rgba(171,53,0,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">calendar_month</span>
                Request Viewing
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="w-full bg-[#ab3500]/10 hover:bg-[#ab3500]/15 text-[#ab3500] font-label-md text-[15px] font-semibold py-4 rounded-full active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                Contact Owner
              </button>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <img
                src={owner.avatar}
                alt={owner.name}
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <p className="font-label-md text-[14px] text-[#191c1d] font-bold">{owner.name}</p>
                <p className="font-body-md text-[12px] text-[#594139]">Owner - Typically replies in 1h</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 w-full z-50 bg-white border-t border-gray-200 p-4 flex items-center justify-between gap-4 shadow-[0_-4px_20px_0px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <span className="font-headline-sm text-[20px] text-[#ab3500] font-bold">
            {room.price >= 1000000 ? `${(room.price / 1000000).toFixed(1)}M` : room.price.toLocaleString()} VND
          </span>
          <span className="font-label-sm text-[12px] text-[#594139]">/ month</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/chat')}
            className="w-12 h-12 bg-[#ab3500]/10 text-[#ab3500] rounded-full flex items-center justify-center hover:bg-[#ab3500]/15 active:scale-95 transition-all border border-[#ab3500]/20"
          >
            <span className="material-symbols-outlined">chat_bubble</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#ab3500] text-white font-label-md text-[14px] font-semibold px-6 py-3 rounded-full shadow-[0_8px_24px_0px_rgba(171,53,0,0.2)] hover:opacity-90 active:scale-95 transition-all"
          >
            Request View
          </button>
        </div>
      </div>

      {/* Viewing request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border">
            <h3 className="text-xl font-bold text-[#191c1d] mb-4">Request Room Viewing</h3>
            
            <form onSubmit={handleRequestViewing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#594139] mb-1">Select Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#ab3500]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#594139] mb-1">Select Time</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#ab3500]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#ab3500] hover:bg-[#ab3500]/95 rounded-xl shadow-md"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}