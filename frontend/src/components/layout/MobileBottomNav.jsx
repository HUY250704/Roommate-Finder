import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, MessageSquare, User, Compass, PlusCircle } from 'lucide-react';
import { useStore } from '../../store';
import VietmapModal from '../common/VietmapModal';

export default function MobileBottomNav() {
  const { currentUser, favorites } = useStore();
  const navigate = useNavigate();
  const [showVietmapModal, setShowVietmapModal] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around">
          
          {/* Home */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                isActive ? 'text-[#ab3500] font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
              }`
            }
          >
            <Home size={20} />
            <span className="text-[10px] mt-0.5">Khám phá</span>
          </NavLink>

          {/* Roommate Requests */}
          <NavLink
            to="/requests"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                isActive ? 'text-[#ab3500] font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
              }`
            }
          >
            <Search size={20} />
            <span className="text-[10px] mt-0.5">Tìm bạn</span>
          </NavLink>

          {/* Vietmap GIS Action */}
          <button
            onClick={() => setShowVietmapModal(true)}
            className="flex flex-col items-center justify-center py-1 px-2 text-[#ab3500] transition active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ab3500] to-[#e64a19] text-white flex items-center justify-center shadow-md -mt-4 border-2 border-white">
              <Compass size={20} />
            </div>
            <span className="text-[10px] mt-0.5 font-bold text-[#ab3500]">Vietmap</span>
          </button>

          {/* Saved */}
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                isActive ? 'text-[#ab3500] font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
              }`
            }
          >
            <Heart size={20} />
            {favorites.length > 0 && (
              <span className="absolute top-0 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {favorites.length}
              </span>
            )}
            <span className="text-[10px] mt-0.5">Đã lưu</span>
          </NavLink>

          {/* Profile / Chat */}
          <NavLink
            to={currentUser ? "/profile" : "/login"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                isActive ? 'text-[#ab3500] font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
              }`
            }
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Profile" className="w-5 h-5 rounded-full object-cover border border-gray-300" />
            ) : (
              <User size={20} />
            )}
            <span className="text-[10px] mt-0.5">{currentUser ? 'Hồ sơ' : 'Đăng nhập'}</span>
          </NavLink>
        </div>
      </nav>

      {/* Vietmap Modal on Mobile */}
      <VietmapModal isOpen={showVietmapModal} onClose={() => setShowVietmapModal(false)} />
    </>
  );
}
