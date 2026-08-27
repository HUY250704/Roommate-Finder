import React, { useState } from 'react';
import { useStore } from '../../store';

export default function AdminUsers() {
  const { users, updateUserStatus } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          (user.email && user.email.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'All') return matchesSearch;
    if (filter === 'Verified') return matchesSearch && user.id === 'minh'; // minh is verified in store
    if (filter === 'Suspended') return matchesSearch && user.status === 'suspended';
    return matchesSearch && user.status === 'active';
  });

  const handleToggleStatus = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    updateUserStatus(userId, nextStatus);
    alert(`User status changed to ${nextStatus}`);
  };

  // Mock stats from design
  const totalUsersCount = '124,592';
  const activeSeekersCount = '89,014';
  const newRegistrationsCount = '3,421';

  return (
    <div className="p-8 space-y-8 bg-[#fff8f6] min-h-screen font-sans text-[#281712]">
      {/* Title */}
      <div>
        <h1 className="font-display-lg text-[32px] md:text-[40px] font-extrabold tracking-tight">
          User Management
        </h1>
        <p className="font-body-md text-[16px] text-[#5c4037]">Review, verify, and moderate registered users.</p>
      </div>

      {/* Summary Cards Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#ffe9e3] rounded-full text-[#aa3000]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                group
              </span>
            </div>
            <span className="bg-[#aa3000]/10 text-[#aa3000] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">+18% today</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">{totalUsersCount}</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Total Users</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 rounded-full text-[#005FAC]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                how_to_reg
              </span>
            </div>
            <span className="bg-blue-100 text-[#005FAC] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">Active Seekers</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">{activeSeekersCount}</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Active Match Seekers</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-100 rounded-full text-green-700">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                person_add
              </span>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-label-md text-[12px] font-bold">New Accounts</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">{newRegistrationsCount}</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">New Registrations</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#5c4037]">
            search
          </span>
          <input
            className="w-full pl-12 pr-4 py-3 rounded-full border border-[#e6beb2] bg-white font-body-md text-[14px] text-[#281712] focus:outline-none focus:border-[#aa3000]"
            placeholder="Search by name, email, or handle..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['All', 'Active', 'Verified', 'Suspended'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full font-label-md text-[12px] font-bold transition-all active:scale-95 ${
                filter === f ? 'bg-[#aa3000] text-white shadow-sm' : 'bg-white text-[#5c4037] border border-[#e6beb2] hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <img
                    className="w-16 h-16 rounded-full object-cover shadow-sm border border-[#ffe9e3]"
                    alt={user.name}
                    src={user.avatar}
                  />
                  <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${
                    user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h4 className="font-headline-sm text-[18px] text-[#281712] font-bold leading-tight">{user.name}</h4>
                  <p className="font-label-md text-[12px] text-[#5c4037] mt-1">@{user.id}</p>
                </div>
              </div>
              {user.id === 'minh' ? (
                <span className="px-3 py-1 bg-blue-50 text-[#005FAC] font-label-md text-[12px] rounded-full flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  Verified
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 font-label-md text-[12px] rounded-full font-bold">
                  {user.role}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-[#ffe9e3]">
              <div>
                <p className="font-label-md text-[10px] uppercase text-[#5c4037] font-semibold">Joined</p>
                <p className="font-body-md text-[13px] text-[#281712] font-bold">Oct 12, 2023</p>
              </div>
              <div>
                <p className="font-label-md text-[10px] uppercase text-[#5c4037] font-semibold">Status</p>
                <p className="font-body-md text-[13px] text-[#281712] flex items-center gap-1 font-bold">
                  <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {user.status === 'active' ? 'Active' : 'Suspended'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Showing details for ${user.name}`)}
                className="flex-1 h-12 rounded-full bg-[#FFF0EA] text-[#aa3000] font-label-md text-[13px] font-bold hover:bg-[#ffdbd0] transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-12 h-12 rounded-full border border-[#e6beb2] text-[#281712] hover:bg-[#ffe9e3]/50 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </button>
              {user.role !== 'admin' && (
                <button
                  onClick={() => handleToggleStatus(user.id, user.status)}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
                    user.status === 'active'
                      ? 'border-red-200 text-[#ba1a1a] hover:bg-red-50'
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                  title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {user.status === 'active' ? 'block' : 'check_circle'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}