import React, { useState } from 'react';
import { useStore } from '../../store';
import { User, Mail, Phone, Briefcase, Award, Save } from 'lucide-react';

export default function Profile() {
  const { currentUser } = useStore();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [occupation, setOccupation] = useState(currentUser?.occupation || '');
  const [cleanHabit, setCleanHabit] = useState(currentUser?.cleanHabit || 'Very clean');
  const [intro, setIntro] = useState(currentUser?.intro || '');

  const handleSave = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <img src={currentUser?.avatar} alt={name} className="w-24 h-24 rounded-full border-4 border-white object-cover" />
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <p className="text-gray-500 text-sm">{currentUser?.email} - {currentUser?.role}</p>

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness Habits</label>
                <select
                  value={cleanHabit}
                  onChange={(e) => setCleanHabit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Very clean">Very clean</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Relaxed">Relaxed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Self Introduction</label>
              <textarea
                rows="4"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="Tell others about yourself..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Save className="w-5 h-5" /> Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}