import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function RoommateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, currentUser } = useStore();

  const roommateId = id || 'minh';
  const user = users.find(u => u.id === roommateId) || users[0];

  const [saved, setSaved] = useState(false);
  const [showMatchBreakdown, setShowMatchBreakdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Scam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const matchDetails = [
    { label: 'Budget Compatibility (20%)', score: 95, color: 'bg-green-500' },
    { label: 'Location Preference (20%)', score: 90, color: 'bg-blue-500' },
    { label: 'Lifestyle & Habits (25%)', score: 92, color: 'bg-purple-500' },
    { label: 'House Rules & Cleanliness (20%)', score: 96, color: 'bg-[#ab3500]' },
    { label: 'Interests & Hobbies (10%)', score: 85, color: 'bg-amber-500' },
    { label: 'Other Preferences (5%)', score: 90, color: 'bg-teal-500' },
  ];

  const handleSendRequest = () => {
    alert(Request sent to \!);
    navigate('/chat');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportDetails('');
      alert('Report submitted successfully to System Administrator.');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 font-sans relative">
      {/* Contextual Top Nav */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center text-[#191c1d] hover:bg-gray-100 transition-colors"
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
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16 text-white flex justify-between items-end">
            <div>
              <h1 className="font-display-lg text-[32px] font-bold text-white flex items-center gap-2">
                {user.name}, {user.age || 24}
                <span className="material-symbols-outlined text-[#5fa6fd]" title="Verified Profile">
                  verified
                </span>
              </h1>
              <p className="font-body-lg text-[18px] opacity-90 mt-1">{user.occupation}</p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">report</span>
              Report
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-5 md:px-0 py-6 space-y-6">
          {/* Match Score Hero Card */}
          <section className="bg-white rounded-xl p-5 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150">
            <div className="flex items-center justify-between">
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
                      strokeDasharray={\, 100}
                      strokeLinecap="round"
                      strokeWidth="3"
                    ></path>
                  </svg>
                  <span className="font-headline-sm text-[20px] text-[#ab3500] font-bold">
                    {user.matchScore || 92}%
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-[20px] text-[#191c1d] font-bold">Lifestyle Match</h2>
                  <p className="font-body-md text-[14px] text-[#594139]">{user.matchReason || 'High compatibility score'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMatchBreakdown(!showMatchBreakdown)}
                className="bg-[#ab3500]/10 text-[#ab3500] text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#ab3500]/20 transition-colors flex items-center gap-1"
              >
                {showMatchBreakdown ? 'Hide Breakdown' : 'View Breakdown'}
                <span className="material-symbols-outlined text-[16px]">
                  {showMatchBreakdown ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>

            {/* Matching Breakdown Accordion */}
            {showMatchBreakdown && (
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                <h4 className="font-label-md text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Compatibility Breakdown (Weighted Score)
                </h4>
                {matchDetails.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-[#191c1d]">
                      <span>{item.label}</span>
                      <span className="font-bold">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={h-full \ rounded-full transition-all duration-500}
                        style={{ width: \% }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bio */}
          <section className="bg-white rounded-xl p-5 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150">
            <h3 className="font-headline-sm text-[20px] text-[#191c1d] font-bold mb-3">About {user.name}</h3>
            <p className="text-[#594139] text-[15px] leading-relaxed whitespace-pre-line">
              {user.intro}
            </p>
          </section>

          {/* Lifestyle Bento Grid */}
          <section>
            <h3 className="font-headline-sm text-[20px] text-[#191c1d] font-bold mb-3 px-1">Lifestyle Habits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-150 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-[#005fac]/10 text-[#005fac] flex items-center justify-center">
                  <span className="material-symbols-outlined">bedtime</span>
                </div>
                <h4 className="font-label-md text-[14px] text-[#594139] font-medium">Sleep Schedule</h4>
                <p className="font-body-md text-[16px] text-[#191c1d] font-semibold">{user.sleepSchedule || 'Usually by 23:00'}</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-150 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-[#00696b]/10 text-[#00696b] flex items-center justify-center">
                  <span className="material-symbols-outlined">cleaning_services</span>
                </div>
                <h4 className="font-label-md text-[14px] text-[#594139] font-medium">Cleanliness</h4>
                <p className="font-body-md text-[16px] text-[#191c1d] font-semibold">{user.cleanHabit || 'High Standard'}</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-150 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-[#ab3500]/10 text-[#ab3500] flex items-center justify-center">
                  <span className="material-symbols-outlined">pets</span>
                </div>
                <h4 className="font-label-md text-[14px] text-[#594139] font-medium">Pets</h4>
                <p className="font-body-md text-[16px] text-[#191c1d] font-semibold">{user.pets || 'Love dogs'}</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-150 flex flex-col items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">smoke_free</span>
                </div>
                <h4 className="font-label-md text-[14px] text-[#594139] font-medium">Smoking</h4>
                <p className="font-body-md text-[16px] text-[#191c1d] font-semibold">{user.smoking || 'No smoking'}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 pb-6 shadow-md z-50 flex items-center gap-4 max-w-2xl mx-auto md:left-1/2 md:-translate-x-1/2 md:border-x md:rounded-t-xl">
        <button
          onClick={handleSendRequest}
          className="flex-1 bg-[#ab3500] hover:bg-[#ab3500]/95 text-white font-label-md text-[15px] font-semibold py-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          Send Request
        </button>
        <button
          onClick={() => setSaved(!saved)}
          className={w-14 h-14 rounded-full border flex items-center justify-center transition-colors \}
        >
          <span className="material-symbols-outlined">{saved ? 'bookmark' : 'bookmark_border'}</span>
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600">report</span>
                Report User Profile
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                >
                  <option value="Scam">Scam / Fraud</option>
                  <option value="Fake listing">Fake Profile / Inaccurate Info</option>
                  <option value="Harassment">Harassment / Bullying</option>
                  <option value="Inappropriate content">Inappropriate Content</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Details (Optional)</label>
                <textarea
                  rows="3"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 border rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitted}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  {reportSubmitted ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
