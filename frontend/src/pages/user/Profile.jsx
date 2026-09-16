import React, { useState } from 'react';
import { useStore } from '../../store';
import { User, Mail, Phone, Briefcase, Award, Save, Sparkles } from 'lucide-react';
import { translations } from '../../utils/translations';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

export default function Profile() {
  const { currentUser, language } = useStore();
  const t = translations[language] || translations.vi;

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [occupation, setOccupation] = useState(currentUser?.occupation || '');
  const [cleanHabit, setCleanHabit] = useState(currentUser?.cleanHabit || 'High Standard');
  const [intro, setIntro] = useState(currentUser?.intro || '');

  const handleSave = (e) => {
    e.preventDefault();
    alert(t.profileUpdatedSuccess);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 font-sans">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
        {/* Banner with gradient */}
        <div className="bg-gradient-to-r from-[#ab3500] to-[#e64a19] h-36 relative px-8 flex items-center justify-between">
          <div className="text-white space-y-0.5">
            <h2 className="text-xl font-bold">{t.profileTitle}</h2>
            <p className="text-xs text-orange-100">{currentUser?.email} • {currentUser?.role === 'admin' ? t.adminConsole : 'User'}</p>
          </div>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <div className="absolute -bottom-10 left-8">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={name}
              className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-[#ab3500]/20"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'; }}
            />
          </div>
        </div>
        
        <div className="pt-14 pb-8 px-6 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{name}</h1>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>{t.verified}</span>
              </p>
            </div>
            <div className="sm:hidden">
              <LanguageSwitcher />
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t.fullName}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm outline-none focus:bg-white focus:border-[#ab3500] focus:ring-2 focus:ring-[#ab3500]/15 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t.phoneNumber}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm outline-none focus:bg-white focus:border-[#ab3500] focus:ring-2 focus:ring-[#ab3500]/15 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t.occupation}
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder={language === 'vi' ? 'Ví dụ: Sinh viên ĐH Bách Khoa / Lập trình viên' : 'e.g., Software Engineer'}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm outline-none focus:bg-white focus:border-[#ab3500] focus:ring-2 focus:ring-[#ab3500]/15 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t.cleanHabit}
                </label>
                <select
                  value={cleanHabit}
                  onChange={(e) => setCleanHabit(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm outline-none focus:bg-white focus:border-[#ab3500] focus:ring-2 focus:ring-[#ab3500]/15 transition"
                >
                  <option value="High Standard">{t.highStandard}</option>
                  <option value="Moderate">{t.moderate}</option>
                  <option value="Relaxed">{t.relaxed}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.selfIntro}
              </label>
              <textarea
                rows="4"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder={t.selfIntroPlaceholder}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm outline-none focus:bg-white focus:border-[#ab3500] focus:ring-2 focus:ring-[#ab3500]/15 transition leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#ab3500] hover:bg-[#8e2800] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveChanges}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
