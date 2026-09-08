import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Home, Heart, MessageSquare, ShieldAlert, PlusCircle, Search, LogOut, Bell, Building } from 'lucide-react';

export default function UserNavbar() {
  const { currentUser, logout, favorites, addRoom, addRequest } = useStore();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
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
    { id: 1, title: 'Minh accepted your viewing request', time: '10m ago', unread: true },
    { id: 2, title: 'New room listing matches your budget in District 1', time: '2h ago', unread: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (postType === 'room') {
      addRoom({
        title: title || 'Newly Added Room Listing',
        price: Number(price) || 3000000,
        location: location || 'Hai Chau District, Da Nang',
        type: type,
        description: description || 'Beautiful room with full amenities.',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
        ownerId: currentUser?.id || 'sarah',
        verified: true,
      });
      alert('Room listing posted successfully!');
    } else {
      addRequest({
        title: title || 'Looking for Roommate',
        budget: Number(budget) || 3500000,
        location: location || 'Da Nang',
        description: description || 'Seeking neat and quiet roommate.',
      });
      alert('Roommate request posted successfully!');
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
                <span className="text-gray-900">Roommate</span>
                <span className="text-[#ab3500]">Finder</span>
              </Link>
              <div className="hidden md:flex ml-10 space-x-6">
                <Link to="/" className="text-gray-600 hover:text-[#ab3500] flex items-center gap-1 font-medium text-sm">
                  <Search className="w-4 h-4" /> Find Rooms & Roommates
                </Link>
                <Link to="/requests" className="text-gray-600 hover:text-[#ab3500] flex items-center gap-1 font-medium text-sm">
                  <Building className="w-4 h-4" /> Roommate Posts
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#ab3500] text-white hover:bg-[#ab3500]/90 rounded-lg text-sm font-semibold shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> Post Ad
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-gray-500 hover:text-[#ab3500] relative"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b flex justify-between items-center">
                          <span className="font-bold text-sm text-gray-800">Notifications</span>
                          <span className="text-xs text-[#ab3500]">Mark all read</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {notifications.map((n) => (
                            <div key={n.id} className="p-3 hover:bg-gray-50 text-xs">
                              <p className="font-semibold text-gray-800">{n.title}</p>
                              <span className="text-gray-400 mt-1 inline-block">{n.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to="/saved" className="relative p-2 text-gray-500 hover:text-[#ab3500]">
                    <Heart className="w-5 h-5" />
                    {favorites.length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {favorites.length}
                      </span>
                    )}
                  </Link>

                  <Link to="/chat" className="p-2 text-gray-500 hover:text-[#ab3500]">
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  {currentUser.role === 'admin' && (
                    <Link to="/admin/dashboard" className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-medium border border-purple-200">
                      <ShieldAlert className="w-4 h-4" /> Admin
                    </Link>
                  )}

                  <div className="flex items-center space-x-2 border-l pl-3">
                    <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80">
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full border object-cover" />
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">{currentUser.name}</span>
                    </Link>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-1.5" title="Logout">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-[#ab3500] hover:bg-[#ab3500]/90 rounded-lg">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 border">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Create New Listing / Request</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <div className="flex border rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => setPostType('room')}
                className="flex-1 py-2 text-xs font-bold rounded-md transition-colors"
              >
                Post Room Listing
              </button>
              <button
                onClick={() => setPostType('request')}
                className="flex-1 py-2 text-xs font-bold rounded-md transition-colors"
              >
                Post Roommate Request
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={postType === 'room' ? 'e.g., Studio room near University' : 'e.g., Looking for female roommate'}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              {postType === 'room' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Rent (VND)</label>
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">Room Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                    >
                      <option value="Private Studio">Private Studio</option>
                      <option value="Shared Apartment">Shared Apartment</option>
                      <option value="House / Villa">House / Villa</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Budget (VND/month)</label>
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Location / District</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Hai Chau, Da Nang"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional details about amenities, lifestyle preference, quiet hours..."
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#ab3500] hover:bg-[#ab3500]/90 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                >
                  Publish Ad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
