import React, { useState } from 'react';
import { useStore } from '../../store';
import { Plus, DollarSign, MapPin } from 'lucide-react';
import { translations } from '../../utils/translations';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

export default function RoommateRequests() {
  const { requests, users, addRequest, language } = useStore();
  const t = translations[language] || translations.vi;
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('Hai Chau, Da Nang');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addRequest({
      title,
      budget: Number(budget),
      location,
      description: desc
    });
    alert(t.requestPostedSuccess);
    setShowModal(false);
    setTitle('');
    setBudget('');
    setDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.requestsTitle}</h1>
          <p className="text-gray-500 mt-1">{t.requestsSubtitle}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <LanguageSwitcher />
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#ab3500] text-white font-medium rounded-xl hover:bg-[#ab3500]/90 transition flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> {t.createRequest}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map(req => {
          const user = users.find(u => u.id === req.userId) || {
            name: 'User',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            gender: 'Unknown',
            occupation: 'Member'
          };
          return (
            <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border object-cover ring-2 ring-orange-100" />
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.gender} • {user.occupation}</p>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-[#ab3500] mb-2">{req.title}</h4>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{req.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-1 font-semibold text-[#ab3500]">
                  <DollarSign className="w-4 h-4" />
                  <span>{t.maxBudget}: {req.budget.toLocaleString()} VND</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{req.location}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">{t.createRequest}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.title}</label>
                <input
                  type="text"
                  required
                  placeholder={t.postPlaceholderRequest}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab3500] focus:border-[#ab3500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.budget}</label>
                  <input
                    type="number"
                    required
                    placeholder="3500000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab3500] focus:border-[#ab3500]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.location}</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.locationPlaceholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                <textarea
                  rows="4"
                  required
                  placeholder={t.descPlaceholder}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab3500] focus:border-[#ab3500]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#ab3500] hover:bg-[#ab3500]/90 rounded-lg shadow-sm"
                >
                  {t.publishAd}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
