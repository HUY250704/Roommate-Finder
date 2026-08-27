import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function RoommateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users } = useStore();

  const roommateId = id || 'minh';
  const user = users.find(u => u.id === roommateId) || users[0];

  const [saved, setSaved] = useState(false);

  const handleSendRequest = () => {
    alert(`Request sent to ${user.name}!`);
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 font-sans relative">
      {/* Contextual Top Nav with Back Button */}
      <div className="absolute top-4 left-4 z-40">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center text-[#191c1d] hover:bg-gray-100 transition-colors pointer-events-auto"
        >
          <span className="material-symbols-outlined font-bold">arrow_back</span>
        </button>
      </div>

      <main className="w-full max-w-2xl mx-auto md:px-5 md:py-8">
        {/* Hero Image */}
        <div className="relative w-full h-96 md:rounded-xl overflow-hidden shadow-sm">
          <img
            className="w-full h-full object-cover"
            alt={user.name}
            src={user.avatar}
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-16 text-white">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="font-display-lg text-[32px] font-bold text-white flex items-center gap-2">
                  {user.name}, {user.age || 24}
                  <span className="material-symbols-outlined text-[#5fa6fd]" title="Verified Profile">
                    verified
                  </span>
                </h1>
                <p className="font-body-lg text-[18px] opacity-90 mt-1">{user.occupation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-5 md:px-0 py-6 space-y-6">
          {/* Match Score Hero */}
          <section className="bg-white rounded-xl p-5 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  ></path>
                  <path
                    className="text-[#ab3500]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${user.matchScore || 90}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3"
                  ></path>
                </svg>
                <span className="font-headline-sm text-[20px] text-[#ab3500] font-bold">
                  {user.matchScore || 90}%
                </span>
              </div>
              <div>
                <h2 className="font-headline-sm text-[20px] text-[#191c1d] font-bold">Excellent Match</h2>
                <p className="font-body-md text-[14px] text-[#594139]">{user.matchReason || 'Based on preferences'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 max-w-[140px] justify-end">
              {(user.preferences || ['Budget', 'Location']).map(pref => (
                <span key={pref} className="flex items-center gap-1 bg-[#00696b]/10 text-[#00696b] px-2 py-1 rounded-full font-label-sm text-[12px] font-semibold">
                  <span className="material-symbols-outlined text-[14px]">
                    {pref === 'Budget' ? 'payments' : pref === 'Location' ? 'location_on' : 'smoke_free'}
                  </span>
                  {pref}
                </span>
              ))}
            </div>
          </section>

          {/* Bio */}
          <section className="bg-white rounded-xl p-5 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150">
            <h3 className="font-headline-sm text-[20px] text-[#191c1d] font-bold mb-3">About {user.name}</h3>
            <p className="text-[#594139] text-[15px] leading-relaxed whitespace-pre-line">
              {user.intro}
            </p>
          </section>

          {/* Lifestyle Profile Bento Grid */}
          <section>
            <h3 className="font-headline-sm text-[20px] text-[#191c1d] font-bold mb-3 px-1">Lifestyle Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Sleep */}
              <div className="bg-white rounded-xl p-4 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-[#005fac]/10 text-[#005fac] flex items-center justify-center mb-1">
                  <span className="material-symbols-outlined">bedtime</span>
                </div>
                <h4 className="font-label-md text-[14px] text-[#594139] font-medium">Sleep Schedule</h4>
                <p className="font-body-md text-[16px] text-[#191c1d] font-semibold">{user.sleepSchedule || 'Usually by 23:00'}</p>
              </div>

              {/* Cleanliness */}
              <div className="bg-white rounded-xl p-4 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-[#00696b]/10 text-[#00696b] flex items-center justify-center mb-1">
                  <span className="material-symbols-outlined">cleaning_services</span>
                </div>
                <h4 className="font-label-md text-[14px] text-[#594139] font-medium">Cleanliness</h4>
                <p className="font-body-md text-[16px] text-[#191c1d] font-semibold">{user.cleanHabit || 'High Standard'}</p>
              </div>

              {/* Pets */}
              <div className="bg-white rounded-xl p-4 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-[#ab3500]/10 text-[#ab3500] flex items-center justify-center mb-1">
                  <span className="material-symbols-outlined">pets</span>
                </div>
                <h4 className="font-label-md text-[14px] text-[#594139] font-medium">Pets</h4>
                <p className="font-body-md text-[16px] text-[#191c1d] font-semibold">{user.pets || 'Love dogs'}</p>
              </div>

              {/* Smoking */}
              <div className="bg-white rounded-xl p-4 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
                  <span className="material-symbols-outlined">smoke_free</span>
                </div>
                <h4 className="font-label-md text-[14px] text-[#594139] font-medium">Smoking</h4>
                <p className="font-body-md text-[16px] text-[#191c1d] font-semibold">{user.smoking || 'No smoking'}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Sticky Action Area */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 pb-6 shadow-[0_-4px_20px_0px_rgba(0,0,0,0.05)] z-50 flex items-center gap-4 max-w-2xl mx-auto md:left-1/2 md:-translate-x-1/2 md:border-x md:rounded-t-xl">
        <button
          onClick={handleSendRequest}
          className="flex-1 bg-[#ab3500] hover:bg-[#ab3500]/95 text-white font-label-md text-[15px] font-semibold py-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-[0_4px_12px_0px_rgba(171,53,0,0.2)]"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          Send Request
        </button>
        <button
          onClick={() => setSaved(!saved)}
          aria-label="Save Profile"
          className={`w-14 h-14 rounded-full border flex items-center justify-center transition-colors ${
            saved ? 'bg-[#ab3500]/10 border-[#ab3500] text-[#ab3500]' : 'bg-gray-100 border-gray-200 text-[#594139] hover:bg-gray-200'
          }`}
        >
          <span className="material-symbols-outlined">{saved ? 'bookmark' : 'bookmark_border'}</span>
        </button>
      </div>
    </div>
  );
}