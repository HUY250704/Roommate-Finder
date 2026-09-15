import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Home, Heart, MessageSquare, ShieldAlert, PlusCircle, Search, LogOut, Bell, Building, Compass } from 'lucide-react';
import VietmapModal from '../common/VietmapModal';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { translations } from '../../utils/translations';

export default function UserNavbar() {
  const { currentUser, logout, favorites, addRoom, addRequest, language } = useStore();
  const t = translations[language] || translations.vi;
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showVietmapModal, setShowVietmapModal] = useState(false);
  const [postType, setPostType] = useState('room'); // 'room' or 'request'
  const [showNotifications, setShowNotifications] = useState(false);

  // Form states for Room
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Private Studio');

  // Form states for Roommate Request
  const [budget, setBudget] = useState('');

  const notifications = [
    { id: 1, title: language === 'vi' ? 'Minh đã đồng ý yêu cầu xem phòng của bạn' : 'Minh accepted your viewing request', time: '10m ago', unread: true },
    { id: 2, title: language === 'vi' ? 'Có phòng trọ mới phù hợp với bạn ở Hải Châu' : 'New room listing matches your budget in Hai Chau', time: '2h ago', unread: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (postType === 'room') {
      addRoom({
        title: title || (language === 'vi' ? 'Phòng trọ mới đăng' : 'Newly Added Room Listing'),
        price: Number(price) || 3000000,
        location: location || (language === 'vi' ? 'Hải Châu, Đà Nẵng' : 'Hai Chau District, Da Nang'),
        type: type,
        description: description || (language === 'vi' ? 'Phòng đẹp đầy đủ tiện nghi.' : 'Beautiful room with full amenities.'),
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
        ownerId: currentUser?.id || 'sarah',
        verified: true,
      });
      alert(t.roomPostedSuccess);
    } else {
      addRequest({
        title: title || (language === 'vi' ? 'Tìm bạn ở ghép' : 'Looking for Roommate'),
        budget: Number(budget) || 3500000,
        location: location || (language === 'vi' ? 'Hải Châu, Đà Nẵng' : 'Da Nang'),
        description: description || (language === 'vi' ? 'Tìm bạn ở ghép sạch sẽ, gọn gàng.' : 'Seeking neat and quiet roommate.'),
      });
      alert(t.requestPostedSuccess);
    }

    setShowModal(false);
    // Reset
    setTitle('');
    setPrice('');
    setLocation('');
    setDescription('');
    setBudget('');
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-[#ab3500]">
                <Home className="w-6 h-6 text-[#ab3500]" />
                <span className="text-gray-900">{t.brandName}</span>
                <span className="text-[#ab3500]">{t.brandFinder}</span>
              </Link>
              <div className="hidden md:flex ml-8 space-x-5">
                <Link to="/" className="text-gray-600 hover:text-[#ab3500] flex items-center gap-1 font-medium text-sm">
                  <Search className="w-4 h-4" /> {t.findRoomsRoommates}
                </Link>
                <Link to="/requests" className="text-gray-600 hover:text-[#ab3500] flex items-center gap-1 font-medium text-sm">
                  <Building className="w-4 h-4" /> {t.roommatePosts}
                </Link>
                {/* Vietmap Button in Navbar */}
                <button
                  onClick={() => setShowVietmapModal(true)}
                  className="text-[#ab3500] bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold text-xs transition border border-orange-200"
                >
                  <Compass className="w-3.5 h-3.5 text-[#ab3500]" />
                  <span>{t.vietmapMap}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Language Switcher Button */}
              <LanguageSwitcher />

              {currentUser ? (
                <>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#ab3500] text-white hover:bg-[#ab3500]/90 rounded-lg text-sm font-semibold shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> {t.postListing}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-gray-500 hover:text-[#ab3500] relative"
                      title={t.notifications}
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b flex justify-between items-center">
                          <span className="font-bold text-sm text-gray-800">{t.notifications}</span>
                          <span className="text-xs text-[#ab3500] cursor-pointer hover:underline">
                            {language === 'vi' ? 'Đánh dấu đã đọc' : 'Mark all as read'}
                          </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {notifications.map((n) => (
                            <div key={n.id} className="px-4 py-3 hover:bg-gray-50 border-b last:border-0 cursor-pointer">
                              <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to="/saved" className="relative p-2 text-gray-500 hover:text-[#ab3500]" title={t.savedRooms}>
                    <Heart className="w-5 h-5" />
                    {favorites.length > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {favorites.length}
                      </span>
                    )}
                  </Link>

                  <Link to="/chat" className="p-2 text-gray-500 hover:text-[#ab3500]" title={t.messages}>
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  {currentUser.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>{t.adminConsole}</span>
                    </Link>
                  )}

                  <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                    <Link to="/profile" className="flex items-center space-x-2">
                      <img
                        className="h-8 w-8 rounded-full object-cover border border-gray-300 ring-2 ring-[#ab3500]/20"
                        src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={currentUser.name}
                      />
                      <span className="text-sm font-semibold text-gray-700 hidden lg:inline">{currentUser.name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition"
                      title={t.logout}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#ab3500]"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#ab3500] hover:bg-[#ab3500]/90 rounded-lg shadow-sm"
                  >
                    {language === 'vi' ? 'Đăng ký' : 'Sign Up'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Vietmap Interactive Modal */}
      <VietmapModal isOpen={showVietmapModal} onClose={() => setShowVietmapModal(false)} />

      {/* Create Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-bold text-gray-900">{t.postListing}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <div className="flex border rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => setPostType('room')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${
                  postType === 'room' ? 'bg-white shadow text-[#ab3500]' : 'text-gray-500'
                }`}
              >
                {t.postRoomListing}
              </button>
              <button
                onClick={() => setPostType('request')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${
                  postType === 'request' ? 'bg-white shadow text-[#ab3500]' : 'text-gray-500'
                }`}
              >
                {t.postRoommateRequest}
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.title}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={postType === 'room' ? t.postPlaceholderRoom : t.postPlaceholderRequest}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              {postType === 'room' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.monthlyRent}</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="3000000"
                      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.roomType}</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                    >
                      <option value="Private Studio">{t.privateStudio}</option>
                      <option value="Shared Apartment">{t.sharedApartment}</option>
                      <option value="House / Villa">{t.houseVilla}</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t.budget}</label>
                  <input
                    type="number"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="3500000"
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.location}</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t.locationPlaceholder}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.description}</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descPlaceholder}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ab3500] hover:bg-[#ab3500]/90 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                >
                  {t.publishAd}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
