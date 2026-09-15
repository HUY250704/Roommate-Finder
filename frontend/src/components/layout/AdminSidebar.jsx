import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Menu, X } from 'lucide-react';

export default function AdminSidebar() {
  const { currentUser, logout, reports } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', name: 'User Management', icon: 'group' },
    { path: '/admin/rooms', name: 'Listing Management', icon: 'list_alt' },
    {
      path: '/admin/reports',
      name: 'Reports',
      icon: 'flag',
      badge: reports.filter(r => r.status === 'pending').length
    },
    { path: '/admin/analytics', name: 'Analytics', icon: 'analytics' }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full font-sans bg-white">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-[#ffe9e3]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#aa3000] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            home_pin
          </span>
          <span className="font-headline-md text-[20px] text-[#aa3000] font-extrabold tracking-tight">
            RoomMate Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all ${
                isActive
                  ? 'bg-[#ffdbd0]/40 text-[#aa3000] font-bold'
                  : 'text-[#5c4037] hover:bg-[#ffe9e3]/50'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-[14px] flex-1">{item.name}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-[#ba1a1a] text-white font-label-sm text-[11px] px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin User Info & Exit */}
      <div className="p-6 border-t border-[#ffe9e3] bg-[#fff8f6]/50">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
            alt="Admin Avatar"
            className="w-10 h-10 rounded-full object-cover border border-[#aa3000]/20"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#281712] truncate">{currentUser?.name || 'System Admin'}</p>
            <p className="text-xs text-[#5c4037]">Administrator</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-[#aa3000] hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Go to User Page</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold text-[#ba1a1a] hover:underline text-left"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar for Admin */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ffe9e3] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#aa3000] text-[24px]">home_pin</span>
          <span className="font-bold text-sm text-[#aa3000]">Admin Console</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-gray-700 hover:bg-[#ffe9e3]/50 transition"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-4/5 max-w-xs h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e6beb2] hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
