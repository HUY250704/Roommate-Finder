import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, users, scheduleViewing, toggleFavorite, favorites } = useStore();

  const roomId = id || 'haichau';
  const room = rooms.find(r => r.id === roomId) || rooms[0];
  const owner = users.find(u => u.id === room.ownerId) || users[0];

  const [showViewingModal, setShowViewingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reportReason, setReportReason] = useState('Fake listing');
  const [reportDetails, setReportDetails] = useState('');

  const isFav = favorites.includes(room.id);

  const handleRequestViewing = (e) => {
    e.preventDefault();
    scheduleViewing({
      roomId: room.id,
      userId: 'sarah',
      date,
      time
    });
    setShowViewingModal(false);
    alert('Viewing appointment request submitted to property owner!');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setShowReportModal(false);
    alert('Report submitted for admin review.');
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 font-sans relative">
      {/* Mobile Header Nav */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md px-5 py-4 flex items-center justify-between shadow-sm border-b">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => toggleFavorite(room.id)}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
          >
            <span className={material-symbols-outlined \}>
              {isFav ? 'favorite' : 'favorite_border'}
            </span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <span className="material-symbols-outlined">report</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:mt-8 md:grid md:grid-cols-12 md:gap-6">
        {/* Left Column: Gallery & Details */}
        <div className="md:col-span-8 flex flex-col gap-6">
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
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-label-md text-[14px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined">photo_library</span>
                    Photos
                  </span>
                </div>
              </div>
            </div>

            <div className="md:hidden -mx-5 flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
              {(room.gallery || [room.image]).map((img, idx) => (
                <img
                  key={idx}
                  className="w-full h-72 object-cover snap-center flex-shrink-0"
                  alt={Slide \}
                  src={img}
                />
              ))}
            </div>
          </section>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-150 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-[#ab3500]/10 text-[#ab3500] text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                  {room.type || 'Private Studio'}
                </span>
                <h1 className="text-2xl font-bold text-[#191c1d] mt-2">{room.title}</h1>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {room.location}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(true)}
                className="hidden md:flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium"
              >
                <span className="material-symbols-outlined text-sm">report</span>
                Report Listing
              </button>
            </div>

            <hr />

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{room.description}</p>
            </div>

            <hr />

            <div>
              <h3 className="font-bold text-gray-900 mb-3">Amenities Included</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['High-speed WiFi', 'Air Conditioning', 'Washing Machine', 'Refrigerator', 'Balcony View', 'Parking Spot'].map((am, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-gray-50 p-2.5 rounded-lg border">
                    <span className="material-symbols-outlined text-base text-[#ab3500]">check_circle</span>
                    {am}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Action Card */}
        <div className="hidden md:block md:col-span-4">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-150 sticky top-24 space-y-5">
            <div>
              <span className="text-3xl font-extrabold text-[#ab3500]">
                {room.price >= 1000000 ? \M : room.price.toLocaleString()} VND
              </span>
              <span className="text-gray-500 text-sm font-medium"> / month</span>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowViewingModal(true)}
                className="w-full bg-[#ab3500] hover:bg-[#ab3500]/95 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">calendar_month</span>
                Request Viewing
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                Contact Landlord
              </button>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-xl border">
              <img src={owner.avatar} alt={owner.name} className="w-10 h-10 rounded-full object-cover border" />
              <div>
                <p className="text-sm font-bold text-gray-900">{owner.name}</p>
                <p className="text-xs text-gray-500">Property Host</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Viewing Modal */}
      {showViewingModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border">
            <h3 className="text-lg font-bold text-[#191c1d] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ab3500]">calendar_month</span>
              Schedule Room Viewing
            </h3>
            
            <form onSubmit={handleRequestViewing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#594139] mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ab3500]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#594139] mb-1">Preferred Time</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ab3500]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowViewingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#ab3500] hover:bg-[#ab3500]/95 rounded-lg shadow"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Listing Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <span className="material-symbols-outlined">report</span>
                Report Room Listing
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400">&times;</button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="Fake listing">Fake Listing / Photos</option>
                  <option value="Incorrect Price">Incorrect Price / Fraud</option>
                  <option value="Already Rent Out">Already Rented Out</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Additional Details</label>
                <textarea
                  rows="3"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Explain why this listing violates policies..."
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2 text-xs font-semibold border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
