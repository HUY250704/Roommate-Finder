import React, { useState } from 'react';
import { useStore } from '../../store';
import { Plus, User, DollarSign, MapPin, Tag } from 'lucide-react';

export default function RoommateRequests() {
  const { requests, users, addRequest } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('District 1');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addRequest({
      title,
      budget: Number(budget),
      location,
      description: desc
    });
    alert('Roommate request posted!');
    setShowModal(false);
    setTitle('');
    setBudget('');
    setDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roommate Requests</h1>
          <p className="text-gray-500 mt-1">Browse people looking for flatmates and rooms to team up with.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Create Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map(req => {
          const user = users.find(u => u.id === req.userId) || { name: 'Unknown User', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', gender: 'Unknown' };
          return (
            <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border object-cover" />
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.gender} - {user.occupation}</p>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-blue-600 mb-2">{req.title}</h4>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{req.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-1 font-semibold text-blue-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Max: {req.budget.toLocaleString()} VND</span>
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">Create Roommate Request</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seeking quiet roommate for District 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (VND/month)</label>
                  <input
                    type="number"
                    required
                    placeholder="4000000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="District 1">District 1</option>
                    <option value="District 3">District 3</option>
                    <option value="District 5">District 5</option>
                    <option value="Binh Thanh District">Binh Thanh District</option>
                    <option value="District 7">District 7</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intro / Requirements</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your habits, lifestyle, roommate expectations..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}