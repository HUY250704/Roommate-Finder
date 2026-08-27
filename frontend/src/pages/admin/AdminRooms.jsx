import React, { useState } from 'react';
import { useStore } from '../../store';

export default function AdminRooms() {
  const { rooms, updateRoomStatus, deleteRoom } = useStore();
  const [filter, setFilter] = useState('All');

  const filteredRooms = rooms.filter(room => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return room.status === 'pending';
    if (filter === 'Reported') return room.id === 'haichau'; // mock reported
    return true;
  });

  const handleStatusChange = (roomId, status) => {
    updateRoomStatus(roomId, status);
    alert(`Listing status updated to ${status}`);
  };

  const handleDelete = (roomId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      deleteRoom(roomId);
      alert('Listing deleted.');
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#fff8f6] min-h-screen font-sans text-[#281712]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display-lg text-[32px] md:text-[40px] font-extrabold tracking-tight">Listing Management</h2>
          <p className="font-body-md text-[16px] text-[#5c4037]">Review, moderate, and manage property listings.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-full p-2 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3]">
          {['All Listings', 'Pending', 'Reported'].map(f => {
            const isSel = (f === 'All Listings' && filter === 'All') || (f === 'Pending' && filter === 'Pending') || (f === 'Reported' && filter === 'Reported');
            return (
              <button
                key={f}
                onClick={() => setFilter(f === 'All Listings' ? 'All' : f)}
                className={`px-6 py-2 rounded-full font-label-md text-[12px] font-bold transition-all active:scale-95 ${
                  isSel ? 'bg-[#aa3000] text-white shadow-sm' : 'text-[#5c4037] hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Cards Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#ffe9e3] rounded-full text-[#aa3000]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                pending_actions
              </span>
            </div>
            <span className="bg-[#aa3000]/10 text-[#aa3000] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">+12% today</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">42</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Pending Approvals</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 rounded-full text-[#005FAC]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                apartment
              </span>
            </div>
            <span className="bg-blue-100 text-[#005FAC] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">Total Rooms</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">1,204</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Active Listings</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 rounded-full text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
            </div>
            <span className="bg-red-100 text-[#ba1a1a] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">Needs Review</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">8</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Reported Listings</p>
          </div>
        </div>
      </div>

      {/* Listings Table Layout */}
      <div className="bg-white rounded-[24px] shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-[#ffe9e3] text-xs font-bold uppercase tracking-wider text-[#5c4037]">
          <div className="col-span-5 md:col-span-4">Room Details</div>
          <div className="hidden md:block col-span-2">Owner</div>
          <div className="hidden md:block col-span-2">Location</div>
          <div className="col-span-3 md:col-span-1 text-right">Price</div>
          <div className="col-span-4 md:col-span-3 text-right">Actions</div>
        </div>

        <div className="divide-y divide-[#ffe9e3]">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors hover:bg-gray-50 ${
                room.id === 'haichau' && filter === 'Reported' ? 'bg-red-50/50' : ''
              }`}
            >
              {/* Room details */}
              <div className="col-span-5 md:col-span-4 flex items-center gap-4">
                <img
                  className="w-16 h-16 rounded-xl object-cover shadow-sm border border-[#ffe9e3] flex-shrink-0"
                  alt={room.title}
                  src={room.image}
                />
                <div className="min-w-0">
                  <h4 className="font-headline-sm text-[16px] text-[#281712] font-bold truncate">{room.title}</h4>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    room.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {room.status}
                  </span>
                </div>
              </div>

              {/* Owner */}
              <div className="hidden md:flex col-span-2 items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#ffdbcf] flex items-center justify-center text-[#aa3000] font-label-md text-[10px] font-bold">
                  {room.ownerId?.substring(0, 2).toUpperCase() || 'JD'}
                </div>
                <span className="font-body-md text-[14px] text-[#5c4037] truncate">{room.ownerId || 'John Doe'}</span>
              </div>

              {/* Location */}
              <div className="hidden md:block col-span-2">
                <span className="font-body-md text-[13px] text-[#5c4037] truncate flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
                  {room.location}
                </span>
              </div>

              {/* Price */}
              <div className="col-span-3 md:col-span-1 text-right font-bold text-[#aa3000] text-[15px]">
                {room.price >= 1000000 ? `${(room.price / 1000000).toFixed(1)}M` : room.price.toLocaleString()}
              </div>

              {/* Actions */}
              <div className="col-span-4 md:col-span-3 flex justify-end gap-2">
                {room.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusChange(room.id, 'approved')}
                    className="p-2 rounded-full text-green-600 hover:bg-green-50 transition-colors"
                    title="Approve"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                  </button>
                )}
                {room.status === 'approved' && (
                  <button
                    onClick={() => handleStatusChange(room.id, 'pending')}
                    className="p-2 rounded-full text-yellow-600 hover:bg-yellow-50 transition-colors"
                    title="Revoke Approval"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(room.id)}
                  className="p-2 rounded-full text-[#ba1a1a] hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}