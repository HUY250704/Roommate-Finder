import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { Home, ArrowLeft, Send, Sparkles } from 'lucide-react';
import { translations } from '../../utils/translations';

export default function RoommateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, currentUser, language } = useStore();
  const t = translations[language] || translations.vi;

  const roommateId = id || 'minh';
  const user = users.find(u => u.id === roommateId || u._id === roommateId);

  const [saved, setSaved] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Scam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 font-sans">
        <div className="max-w-md w-full text-center space-y-5 bg-white p-8 rounded-3xl shadow-lg border border-gray-150">
          <div className="w-16 h-16 bg-orange-50 text-[#ab3500] rounded-full flex items-center justify-center mx-auto border border-orange-100">
            <span className="material-symbols-outlined text-3xl">person_off</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'vi' ? 'Không tìm thấy hồ sơ người dùng' : 'User Profile Not Found'}
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {language === 'vi'
                ? `Hồ sơ người tìm phòng có mã ${roommateId} không tồn tại hoặc đã ngừng hoạt động.`
                : `User profile ID ${roommateId} does not exist or is inactive.`}
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-xl border text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>{language === 'vi' ? 'Quay lại' : 'Go back'}</span>
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-[#ab3500] text-white text-xs font-semibold hover:bg-[#8e2800] transition flex items-center gap-1.5"
            >
              <Home size={14} />
              <span>{language === 'vi' ? 'Tìm người ở ghép khác' : 'Find other roommates'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSendRequest = () => {
    alert(t.requestSentSuccess);
    navigate('/chat');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportDetails('');
      alert(t.reportSuccess);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 font-sans relative">
      {/* Contextual Top Nav */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-[#191c1d] hover:bg-gray-100 transition-colors"
        >
          <span className="material-symbols-outlined font-bold">arrow_back</span>
        </button>
      </div>

      <main className="w-full max-w-2xl mx-auto px-4 md:px-5 md:py-8">
        {/* Hero Image */}
        <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-sm">
          <img
            className="w-full h-full object-cover"
            alt={user.name}
            src={user.avatar}
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16 text-white flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {user.name}, {user.age || 24}
                <span className="material-symbols-outlined text-[#5fa6fd]" title="Verified Profile">
                  verified
                </span>
              </h1>
              <p className="text-base opacity-90 mt-1">{user.occupation}</p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">report</span>
              <span>{t.reportUser}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-6 space-y-6">
          {/* Match Score Hero Card */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-150">
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
                      strokeDasharray={`${user.matchScore || 92}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3"
                    ></path>
                  </svg>
                  <span className="text-base font-bold text-[#ab3500] absolute">
                    {user.matchScore || 92}%
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t.matchScore}</h3>
                  <p className="text-xs text-gray-500">{user.matchReason || (language === 'vi' ? 'Dựa trên 4 sở thích tương đồng' : 'Based on 4 shared preferences')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-150 space-y-3">
            <h3 className="text-base font-bold text-gray-900">{t.selfIntro}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{user.intro}</p>
          </section>

          {/* Habits & Lifestyle Grid */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-gray-900">{language === 'vi' ? 'Thói quen & Lối sống' : 'Habits & Lifestyle'}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3.5 border border-gray-150 space-y-1">
                <span className="text-xs text-gray-500 font-semibold">{t.cleanHabit}</span>
                <p className="text-sm font-bold text-gray-900">{user.cleanHabit || t.highStandard}</p>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-gray-150 space-y-1">
                <span className="text-xs text-gray-500 font-semibold">{t.smoking}</span>
                <p className="text-sm font-bold text-gray-900">{user.smoking || t.noSmoking}</p>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-gray-150 space-y-1">
                <span className="text-xs text-gray-500 font-semibold">{t.pets}</span>
                <p className="text-sm font-bold text-gray-900">{user.pets || (language === 'vi' ? 'Thích thú cưng' : 'Pet friendly')}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 shadow-lg flex items-center justify-center">
        <div className="max-w-md w-full flex items-center gap-3">
          <button
            onClick={() => setSaved(!saved)}
            className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
          >
            <span className="material-symbols-outlined">{saved ? 'bookmark' : 'bookmark_border'}</span>
          </button>
          <button
            onClick={handleSendRequest}
            className="flex-1 py-3 bg-[#ab3500] hover:bg-[#8e2800] text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Send size={16} />
            <span>{t.sendRoommateRequest}</span>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined">report</span>
                {t.reportUser}
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.reportReason}</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none bg-white"
                >
                  <option value="Scam">{language === 'vi' ? 'Lừa đảo / Tài khoản mạo danh' : 'Scam or fake profile'}</option>
                  <option value="Harassment">{language === 'vi' ? 'Quấy rối / Lời lẽ không phù hợp' : 'Harassment'}</option>
                  <option value="Other">{language === 'vi' ? 'Lý do khác' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.reportDetails}</label>
                <textarea
                  rows="3"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={language === 'vi' ? 'Mô tả chi tiết hành vi vi phạm...' : 'Describe the issue...'}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#ab3500] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitted}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  {reportSubmitted ? (language === 'vi' ? 'Đang gửi...' : 'Submitting...') : t.submitReport}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
