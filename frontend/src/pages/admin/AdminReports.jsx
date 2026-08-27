import React, { useState } from 'react';
import { useStore } from '../../store';

export default function AdminReports() {
  const { reports, resolveReport } = useStore();
  const [filter, setFilter] = useState('All');

  const filteredReports = reports.filter(r => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return r.status === 'pending';
    if (filter === 'Resolved') return r.status === 'resolved';
    return true;
  });

  const handleResolve = (id) => {
    resolveReport(id);
    alert('Report marked as resolved!');
  };

  // Mock safety list from template
  const mockReportsList = [
    {
      id: 'r1',
      reportedEntity: '@alex_jordan',
      type: 'user',
      reason: 'Harassment',
      reportedBy: '@sam_smith',
      time: '2 hours ago',
      desc: 'User kept sending inappropriate messages after I declined their room viewing.',
      status: 'Pending'
    },
    {
      id: 'r2',
      reportedEntity: 'Sunny Studio in Brooklyn',
      type: 'listing',
      reason: 'Scam / Fake',
      reportedBy: 'Multiple Users (3)',
      time: '5 hours ago',
      desc: 'Listing images belong to another property listed on a different website.',
      status: 'Investigating'
    },
    {
      id: 'r3',
      reportedEntity: '@chris_k',
      type: 'user',
      reason: 'Inappropriate',
      reportedBy: '@taylor_j',
      time: 'Yesterday',
      desc: 'Profile description contains offensive and inappropriate language.',
      status: 'Resolved'
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-[#fff8f6] min-h-screen font-sans text-[#281712]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display-lg text-[32px] md:text-[40px] font-extrabold tracking-tight">Reports Management</h2>
          <p className="font-body-md text-[16px] text-[#5c4037]">Review and action community safety flags.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'Resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full font-label-md text-[12px] font-bold transition-all active:scale-95 ${
                filter === f ? 'bg-[#aa3000] text-white shadow-sm' : 'bg-white text-[#5c4037] border border-[#e6beb2] hover:bg-gray-50'
              }`}
            >
              {f} Reports
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#ffe9e3] rounded-full text-[#aa3000]">
              <span className="material-symbols-outlined text-[28px]">flag</span>
            </div>
            <span className="bg-[#aa3000]/10 text-[#aa3000] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">+12%</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">1,248</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Total Reports</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-700">
              <span className="material-symbols-outlined text-[28px]">hourglass_empty</span>
            </div>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-label-md text-[12px] font-bold">Active</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">84</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Pending Review</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-100 rounded-full text-green-700">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-label-md text-[12px] font-bold">Resolved</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">42</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Resolved Today</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 rounded-full text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <span className="bg-red-100 text-[#ba1a1a] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">Urgent</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">7</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Safety Alerts</p>
          </div>
        </div>
      </div>

      {/* Reports Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockReportsList
          .filter(r => filter === 'All' || r.status.toLowerCase().includes(filter.toLowerCase()))
          .map(rep => (
            <div
              key={rep.id}
              className={`bg-white rounded-2xl p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between ${
                rep.status === 'Pending' ? 'border-l-4 border-l-[#ba1a1a]' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-lg">
                      {rep.type === 'user' ? 'person_off' : 'apartment'}
                    </span>
                    <h4 className="font-headline-sm text-[16px] text-[#281712] font-bold">{rep.reportedEntity}</h4>
                  </div>
                  <span className="text-xs text-[#5c4037] font-semibold">{rep.time}</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-red-100 text-[#ba1a1a] rounded text-[10px] font-bold uppercase tracking-wider">
                    {rep.reason}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                    by {rep.reportedBy}
                  </span>
                </div>
                <p className="text-[13px] text-[#5c4037] italic leading-relaxed bg-[#fff8f6] p-3 rounded-xl border border-[#ffe9e3] mb-4">
                  "{rep.desc}"
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                <span className="text-[12px] text-[#5c4037] font-bold">Status: {rep.status}</span>
                <div className="flex gap-2">
                  {rep.status !== 'Resolved' && (
                    <button
                      onClick={() => alert(`Action taken on ${rep.reportedEntity}`)}
                      className="px-4 py-1.5 bg-[#aa3000] text-white font-label-md text-[11px] font-bold rounded-full transition-transform active:scale-95 shadow-sm"
                    >
                      Take Action
                    </button>
                  )}
                  <button className="p-1 rounded-full hover:bg-gray-100">
                    <span className="material-symbols-outlined text-gray-500">more_vert</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}