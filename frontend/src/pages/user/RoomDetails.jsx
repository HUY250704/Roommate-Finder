import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';
import VietmapView from '../../components/common/VietmapView';
import { Home, ArrowLeft } from 'lucide-react';
import { translations } from '../../utils/translations';

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, users, scheduleViewing, toggleFavorite, favorites, language } = useStore();
  const t = translations[language] || translations.vi;

  const roomId = id || 'haichau';
  const room = rooms.find(r => r.id === roomId || r._id === roomId);
  const owner = room ? (users.find(u => u.id === room.ownerId) || users[0]) : null;

  const [showViewingModal, setShowViewingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reportReason, setReportReason] = useState('Fake listing');
  const [reportDetails, setReportDetails] = useState('');

  if (!room) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 font-sans">
        <div className="max-w-md w-full text-center space-y-5 bg-white p-8 rounded-3xl shadow-lg border border-gray-150">
          <div className="w-16 h-16 bg-orange-50 text-[#ab3500] rounded-full flex items-center justify-center mx-auto border border-orange-100">
            <span className="material-symbols-outlined text-3xl">home_work</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'vi' ? 'Không tìm thấy phòng trọ' : 'Room Not Found'}
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {language === 'vi'
                ? `Phòng trọ có mã ${roomId} không tồn tại hoặc đã được gỡ xuống.`
                : `Room listing ID ${roomId} does not exist or has been removed.`}
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-xl border text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>{language === 'vi' ? 'Quay lại' : 'Go back'}</span>
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-[#ab3500] text-white text-xs font-semibold hover:bg-[#8e2800] transition flex items-center gap-1.5"
            >
              <Home size={14} />
              <span>{language === 'vi' ? 'Khám phá phòng khác' : 'Explore other rooms'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    alert(t.viewingRequestSuccess);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setShowReportModal(false);
    alert(t.reportSuccess);
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
            <span className="material-symbols-outlined text-[#ab3500]">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 md:mt-8 md:grid md:grid-cols-12 md:gap-6">
        {/* Left Column: Gallery & Details */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <section className="relative">
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
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
                    {language === 'vi' ? 'Hình ảnh' : 'Photos'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:hidden -mx-4 flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
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

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-[#ab3500]/10 text-[#ab3500] text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                  {room.type || t.privateStudio}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">{room.title}</h1>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-base text-gray-400">location_on</span>
                  {room.address || room.location}
                </p>
              </div>

              <button
                onClick={() => setShowReportModal(true)}
                className="hidden md:flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">report</span>
                {t.reportRoom}
              </button>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="font-bold text-gray-900 mb-2">{t.description}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{room.description}</p>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="font-bold text-gray-900 mb-3">{language === 'vi' ? 'Tiện ích có sẵn' : 'Amenities Included'}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  language === 'vi' ? 'Wifi tốc độ cao' : 'High-speed WiFi',
                  language === 'vi' ? 'Điều hòa inverter' : 'Air Conditioning',
                  language === 'vi' ? 'Máy giặt riêng' : 'Washing Machine',
                  language === 'vi' ? 'Tủ lạnh' : 'Refrigerator',
                  language === 'vi' ? 'Ban công thoáng mát' : 'Balcony View',
                  language === 'vi' ? 'Chỗ để xe an ninh' : 'Parking Spot'
                ].map((am, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="material-symbols-outlined text-base text-[#ab3500]">check_circle</span>
                    {am}
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Vietmap GIS Section */}
            <div>
              <VietmapView 
                address={room.address} 
                location={room.location} 
                title={room.title} 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Action Card */}
        <div className="hidden md:block md:col-span-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-150 sticky top-24 space-y-5">
            <div>
              <span className="text-3xl font-extrabold text-[#ab3500]">
                {room.price >= 1000000 ? `${(room.price / 1000000).toFixed(1)}M` : room.price.toLocaleString()} VND
              </span>
              <span className="text-gray-500 text-sm font-medium"> / {language === 'vi' ? 'tháng' : 'month'}</span>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowViewingModal(true)}
                className="w-full bg-[#ab3500] hover:bg-[#8e2800] text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined">calendar_month</span>
                {t.scheduleViewing}
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                {t.contactLandlord}
              </button>
            </div>

            {owner && (
              <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                <img src={owner.avatar} alt={owner.name} className="w-10 h-10 rounded-full object-cover border" />
                <div>
                  <p className="text-sm font-bold text-gray-900">{owner.name}</p>
                  <p className="text-xs text-gray-500">{language === 'vi' ? 'Chủ nhà / Người đăng' : 'Property Host'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Viewing Modal */}
      {showViewingModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-[#191c1d] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ab3500]">calendar_month</span>
                {t.scheduleViewing}
              </h3>
              <button onClick={() => setShowViewingModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleRequestViewing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.viewingDate}</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.viewingTime}</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowViewingModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ab3500] hover:bg-[#8e2800] text-white rounded-xl text-xs font-bold shadow transition"
                >
                  {t.submitViewingRequest}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined">report</span>
                {t.reportRoom}
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.reportReason}</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none bg-white"
                >
                  <option value="Fake listing">{language === 'vi' ? 'Thông tin phòng giả mạo' : 'Fake listing'}</option>
                  <option value="Incorrect price">{language === 'vi' ? 'Giá tiền sai lệch thực tế' : 'Incorrect price'}</option>
                  <option value="Scam">{language === 'vi' ? 'Lừa đảo / Yêu cầu đặt cọc mờ ám' : 'Scam or fraud'}</option>
                  <option value="Other">{language === 'vi' ? 'Lý do khác' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.reportDetails}</label>
                <textarea
                  rows="3"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={language === 'vi' ? 'Mô tả chi tiết vấn đề bạn gặp phải...' : 'Describe the issue in detail...'}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  {t.submitReport}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
