import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Home, Heart, MessageSquare, ShieldAlert, PlusCircle, Search, LogOut } from 'lucide-react';

export default function UserNavbar() {
  const { currentUser, logout, favorites } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
              <Home className="w-6 h-6" />
              <span className="text-gray-900">Roommate</span>
              <span className="text-blue-600">Finder</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 flex items-center gap-1 font-medium">
                <Search className="w-4 h-4" /> Find Rooms
              </Link>
              <Link to="/requests" className="text-gray-600 hover:text-blue-600 flex items-center gap-1 font-medium">
                <PlusCircle className="w-4 h-4" /> Roommate Posts
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link to="/saved" className="relative p-2 text-gray-500 hover:text-blue-600">
                  <Heart className="w-5 h-5" />
                  {favorites.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </Link>
                <Link to="/chat" className="p-2 text-gray-500 hover:text-blue-600">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                {currentUser.role === 'admin' && (
                  <Link to="/admin/dashboard" className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-medium border border-purple-200">
                    <ShieldAlert className="w-4 h-4" /> Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 border-l pl-4">
                  <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full border object-cover" />
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">{currentUser.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-2">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}