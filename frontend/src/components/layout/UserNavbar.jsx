import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Home, Heart, MessageSquare, ShieldAlert, PlusCircle, Search, LogOut, Bell, Building, Compass, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import VietmapModal from '../common/VietmapModal';
import { translations } from '../../utils/translations';
import { API_BASE_URL } from '../../config/api';
import { searchVietmapAddress } from '../../utils/vietmap';

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
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isPostingRoom, setIsPostingRoom] = useState(false);

  // Form states for Roommate Request
  const [budget, setBudget] = useState('');

  const notifications = [
    { id: 1, title: language === 'vi' ? 'Minh đã đồng ý yêu cầu xem phòng của bạn' : 'Minh accepted your viewing request', time: '10m ago', unread: true },
    { id: 2, title: language === 'vi' ? 'Có phòng trọ mới phù hợp với bạn ở Hải Châu' : 'New room listing matches your budget in Hai Chau', time: '2h ago', unread: true },
  ];


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImages((prev) => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    const urls = imageUrlInput
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
    setImages((prev) => [...prev, ...urls]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (postType === 'room') {
      setIsPostingRoom(true);
      try {
        const geocodeResult = await searchVietmapAddress(location);
        const feature = geocodeResult?.data?.features?.[0] || geocodeResult?.features?.[0];
        const point = feature?.geometry?.coordinates;
        if (!Array.isArray(point) || point.length !== 2 ||
            !Number.isFinite(Number(point[0])) || !Number.isFinite(Number(point[1]))) {
          throw new Error(language === 'vi' ? 'Không tìm được tọa độ cho địa chỉ này.' : 'Could not find coordinates for this address.');
        }

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error(language === 'vi' ? 'Vui lòng đăng nhập lại để đăng phòng.' : 'Please sign in again to post a room.');
        }

        const roomTypes = {
          'Private Studio': 'Private',
          'Shared Apartment': 'Shared',
          'House / Villa': 'Entire House',
        };
        const response = await fetch(`${API_BASE_URL}/rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            price: Number(price),
            address: location.trim(),
            location: location.trim(),
            roomType: roomTypes[type] || 'Private',
            description,
            images,
            coordinates: { type: 'Point', coordinates: [Number(point[0]), Number(point[1])] },
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || (language === 'vi' ? 'Không thể đăng phòng.' : 'Could not post room.'));
        }

        addRoom({
          id: data._id,
          title: data.title,
          price: data.price,
          location: data.location,
          type: data.roomType,
          image: data.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
          gallery: data.images || [],
          ownerId: currentUser?.id,
          description: data.description,
          address: data.address,
          coordinates: data.coordinates,
          status: data.status,
          verified: false,
        });
        alert(t.roomPostedSuccess);
      } catch (error) {
        alert(error.message);
        return;
      } finally {
        setIsPostingRoom(false);
      }
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
    setImages([]);
    setImageUrlInput('');
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            
            {/* Left: Brand & Main Navigation Links */}
            <div className="flex items-center gap-5 lg:gap-8 min-w-0">
              <Link to="/" className="flex items-center gap-2 font-extrabold text-base sm:text-xl text-[#ab3500] shrink-0">
                <Home className="w-6 h-6 text-[#ab3500] shrink-0" />
                <span className="text-gray-900 tracking-tight">{t.brandName}</span>
                <span className="hidden sm:inline text-[#ab3500]">{t.brandFinder}</span>
              </Link>

              <div className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-semibold text-gray-700">
                <Link
                  to="/"
                  className="px-3 py-1.5 rounded-lg hover:text-[#ab3500] hover:bg-orange-50/60 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{t.findRoomsRoommates}</span>
                </Link>

                <Link
                  to="/requests"
                  className="px-3 py-1.5 rounded-lg hover:text-[#ab3500] hover:bg-orange-50/60 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Building className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{t.roommatePosts}</span>
                </Link>

                {/* Vietmap Button in Navbar */}
                <button
                  type="button"
                  onClick={() => setShowVietmapModal(true)}
                  className="text-[#ab3500] bg-orange-50 hover:bg-orange-100/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-xs transition border border-orange-200 whitespace-nowrap"
                >
                  <Compass className="w-4 h-4 text-[#ab3500] shrink-0" />
                  <span>{t.vietmapMap}</span>
                </button>
              </div>
            </div>

            {/* Right: Actions, Notifications & Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    aria-label={t.postListing}
                    className="flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 bg-[#ab3500] hover:bg-[#8e2800] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all whitespace-nowrap active:scale-98"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{t.postListing}</span>
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-gray-500 hover:text-[#ab3500] hover:bg-gray-50 rounded-xl transition relative"
                      title={t.notifications}
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-150 py-2 z-50 animate-fadeIn">
                        <div className="px-4 py-2.5 border-b border-gray-100 flex justify-between items-center">
                          <span className="font-bold text-xs uppercase tracking-wider text-gray-800">{t.notifications}</span>
                          <span className="text-xs font-semibold text-[#ab3500] cursor-pointer hover:underline">
                            {language === 'vi' ? 'Đánh dấu đã đọc' : 'Mark all as read'}
                          </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                          {notifications.map((n) => (
                            <div key={n.id} className="px-4 py-2.5 hover:bg-orange-50/50 cursor-pointer transition">
                              <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                              <span className="text-[11px] text-gray-400 mt-0.5 block">{n.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/saved"
                    className="relative hidden md:inline-flex p-2 text-gray-500 hover:text-[#ab3500] hover:bg-gray-50 rounded-xl transition"
                    title={t.savedRooms}
                  >
                    <Heart className="w-5 h-5" />
                    {favorites.length > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {favorites.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/chat"
                    className="p-2 text-gray-500 hover:text-[#ab3500] hover:bg-gray-50 rounded-xl transition"
                    title={t.messages}
                    aria-label={t.messages}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  {currentUser.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-xl shadow-xs whitespace-nowrap transition"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>{t.adminConsole}</span>
                    </Link>
                  )}

                  {/* Profile avatar & Logout */}
                  <div className="hidden md:flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-gray-200">
                    <Link to="/profile" className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition">
                      <img
                        className="h-8 w-8 rounded-full object-cover border border-gray-200 ring-2 ring-[#ab3500]/15"
                        src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'; }}
                      />
                      <span className="text-xs font-bold text-gray-800 hidden xl:inline max-w-[90px] truncate">{currentUser.name}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title={t.logout}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-[#ab3500] hover:bg-gray-50 rounded-xl transition"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-[#ab3500] hover:bg-[#8e2800] rounded-xl shadow-xs transition"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">{t.postListing}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="flex border rounded-xl p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => setPostType('room')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  postType === 'room' ? 'bg-white shadow-xs text-[#ab3500]' : 'text-gray-500'
                }`}
              >
                {t.postRoomListing}
              </button>
              <button
                type="button"
                onClick={() => setPostType('request')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  postType === 'request' ? 'bg-white shadow-xs text-[#ab3500]' : 'text-gray-500'
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
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
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
                      className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.roomType}</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none bg-white"
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
                    className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                  />
                </div>
              )}

              {postType === 'room' && (
                <div className="space-y-2 border border-gray-150 rounded-xl p-3 bg-gray-50/70">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#ab3500]" />
                      <span>{t.roomImages}</span>
                    </label>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {images.length} {language === 'vi' ? 'ảnh đã chọn' : 'photos selected'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">{t.uploadImagesHint}</p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border border-dashed border-[#ab3500]/40 hover:border-[#ab3500] bg-white hover:bg-orange-50/40 text-[#ab3500] py-2 px-3 rounded-lg text-xs font-semibold transition">
                      <Upload className="w-4 h-4" />
                      <span>{t.chooseImages}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Manual URL Input */}
                  <div className="flex gap-1.5 mt-1.5">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder={t.pasteImageUrl}
                      className="flex-1 border rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#ab3500] outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold transition"
                    >
                      {t.addImageUrl}
                    </button>
                  </div>

                  {/* Images Preview Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                          <img src={img} alt={"Uploaded preview " + idx} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow"
                              title={t.removeImage}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-[#ab3500] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              {t.primaryImage}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.description}</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descPlaceholder}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPostingRoom}
                  className="flex-1 py-2.5 bg-[#ab3500] hover:bg-[#8e2800] disabled:opacity-60 disabled:cursor-wait text-white rounded-xl text-sm font-semibold shadow-md transition-colors"
                >
                  {isPostingRoom ? (language === 'vi' ? 'Đang đăng…' : 'Publishing…') : t.publishAd}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
