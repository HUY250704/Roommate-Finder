import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function AdminDashboard() {
  const { users, rooms, reports, resolveReport } = useStore();
  const navigate = useNavigate();

  const totalUsers = users.length;
  const approvedRooms = rooms.filter(r => r.status === 'approved').length;
  const pendingRooms = rooms.filter(r => r.status === 'pending').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

  const handleResolve = (id) => {
    resolveReport(id);
    alert('Report marked as resolved!');
  };

  return (
    <div className="p-8 space-y-8 bg-[#fff8f6] min-h-screen font-sans text-[#281712]">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display-lg text-[32px] md:text-[40px] font-extrabold text-[#281712] tracking-tight">
            Overview
          </h1>
          <p className="font-body-md text-[16px] text-[#5c4037]">Welcome back! Here is what's happening on your platform.</p>
        </div>
        <button
          onClick={() => navigate('/admin/analytics')}
          className="px-6 py-3 rounded-full bg-[#aa3000] hover:bg-[#aa3000]/95 text-white font-label-lg text-[14px] font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          View Analytics
        </button>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#ffe9e3] rounded-full text-[#aa3000]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                group
              </span>
            </div>
            <span className="bg-[#aa3000]/10 text-[#aa3000] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">+2% today</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">{totalUsers + 12000}</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Total Users</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#ffe9e3] rounded-full text-[#aa3000]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                list_alt
              </span>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-label-md text-[12px] font-bold">+4% today</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">{approvedRooms + 3800}</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Active Listings</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#ffe9e3] rounded-full text-[#aa3000]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                pending_actions
              </span>
            </div>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-label-md text-[12px] font-bold">Needs Action</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">{pendingRooms}</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Pending Listings</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 rounded-full text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                flag
              </span>
            </div>
            <span className="bg-red-100 text-[#ba1a1a] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">Urgent</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">{pendingReports}</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Recent Reports</p>
          </div>
        </div>
      </div>

      {/* Grid: SVG chart & recent reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Growth Chart Panel */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] lg:col-span-2">
          <h2 className="font-headline-md text-[20px] font-bold mb-4">User Growth Over Time</h2>
          {/* Beautiful SVG graph representing chart.js design */}
          <div className="h-64 relative flex items-end justify-between px-2 pt-6">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#aa3000" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#aa3000" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#ffe9e3" strokeDasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#ffe9e3" strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#ffe9e3" strokeDasharray="4" />
              {/* Path area */}
              <path
                d="M 0 180 Q 80 140 160 150 T 320 80 T 500 40 L 500 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />
              {/* Path line */}
              <path
                d="M 0 180 Q 80 140 160 150 T 320 80 T 500 40"
                fill="none"
                stroke="#aa3000"
                strokeWidth="4"
              />
            </svg>
            <div className="absolute bottom-2 left-2 text-[11px] text-[#5c4037] font-semibold">Jan</div>
            <div className="absolute bottom-2 left-1/4 text-[11px] text-[#5c4037] font-semibold">Mar</div>
            <div className="absolute bottom-2 left-2/4 text-[11px] text-[#5c4037] font-semibold">May</div>
            <div className="absolute bottom-2 left-3/4 text-[11px] text-[#5c4037] font-semibold">Jul</div>
            <div className="absolute bottom-2 right-2 text-[11px] text-[#5c4037] font-semibold">Sep</div>
          </div>
        </div>

        {/* Recent Reports Panel */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div>
            <h2 className="font-headline-md text-[20px] font-bold mb-4">Recent Reports</h2>
            <div className="space-y-4">
              {reports.slice(0, 3).map(rep => (
                <div key={rep.id} className="p-4 bg-[#fff8f6] rounded-xl border border-[#ffe9e3] flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[14px] text-[#ba1a1a]">@{rep.reportedUser}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      rep.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-[#ba1a1a]'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#5c4037] line-clamp-2">"{rep.reason}"</p>
                  <div className="text-[11px] text-gray-400 mt-1">Reported by: {rep.reportedBy}</div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/reports')}
            className="w-full text-center text-[#aa3000] hover:underline font-bold text-[13px] pt-4"
          >
            Manage All Reports
          </button>
        </div>

      </div>
    </div>
  );
}