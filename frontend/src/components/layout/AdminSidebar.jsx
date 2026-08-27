import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { LayoutDashboard, Users, Home, AlertOctagon, Calendar, LogOut, ArrowLeft } from 'lucide-react';

export default function AdminSidebar() {
  const { currentUser, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', name: 'Manage Users', icon: Users },
    { path: '/admin/rooms', name: 'Manage Rooms', icon: Home },
    { path: '/admin/reports', name: 'Manage Reports', icon: AlertOctagon },
    { path: '/admin/viewings', name: 'Schedule Viewings', icon: Calendar },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col justify-between">
      <div className="p-6">
        <div className="flex items-center space-x-2 text-xl font-bold mb-8 border-b border-gray-800 pb-4">
          <span className="text-purple-400">Roommate</span>
          <span className="text-white">Admin</span>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <img src={currentUser?.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-purple-500 object-cover" />
          <div>
            <div className="text-sm font-semibold truncate w-36">{currentUser?.name}</div>
            <div className="text-xs text-gray-400">Administrator</div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <Link to="/" className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white px-2 py-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Go to User Page</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 px-2 py-1 text-left w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}