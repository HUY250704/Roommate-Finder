import React from 'react';

export default function AdminAnalytics() {
  const popularLocations = [
    { name: 'Hai Chau', value: 42, color: 'bg-[#aa3000]' },
    { name: 'Thanh Khe', value: 28, color: 'bg-[#73584f]' },
    { name: 'Son Tra', value: 18, color: 'bg-[#0075d5]' },
    { name: 'Ngu Hanh Son', value: 12, color: 'bg-green-600' }
  ];

  const successCategories = [
    { name: 'Lifestyle Compatibility', value: 92, icon: 'coffee', desc: 'Cleanliness, habits, hours' },
    { name: 'Budget Alignment', value: 88, icon: 'payments', desc: 'Rent range, utilities' },
    { name: 'Location Preference', value: 76, icon: 'location_on', desc: 'Distance to work/uni' }
  ];

  const highPerformers = [
    { title: 'Studio in Hai Chau', matches: 45, inquiries: 12, rating: '5.0', type: 'room' },
    { title: 'Shared Flat Thanh Khe', matches: 32, inquiries: 8, rating: '4.8', type: 'room' },
    { title: 'Alex Nguyen', matches: 28, inquiries: 15, rating: '5.0', type: 'user' }
  ];

  return (
    <div className="p-8 space-y-8 bg-[#fff8f6] min-h-screen font-sans text-[#281712]">
      {/* Title */}
      <div>
        <h1 className="font-display-lg text-[32px] md:text-[40px] font-extrabold tracking-tight">Platform Analytics</h1>
        <p className="font-body-md text-[16px] text-[#5c4037]">Key metrics and performance insights.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#ffe9e3] rounded-full text-[#aa3000]">
              <span className="material-symbols-outlined text-[28px]">trending_up</span>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-label-md text-[12px] font-bold">8.2% vs lm</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">+12.4k</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">User Growth</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 rounded-full text-[#005FAC]">
              <span className="material-symbols-outlined text-[28px]">apartment</span>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-label-md text-[12px] font-bold">3.1% vs lm</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">4,821</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Active Listings</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-100 rounded-full text-green-700">
              <span className="material-symbols-outlined text-[28px]">handshake</span>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-label-md text-[12px] font-bold">15.4% vs lm</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">2,104</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Successful Matches</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <span className="material-symbols-outlined text-[28px]">star</span>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-label-md text-[12px] font-bold">Consistent</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">87%</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">Avg Match Score</p>
          </div>
        </div>
      </div>

      {/* Bento content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Popular Locations */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] space-y-6">
          <h2 className="font-headline-md text-[20px] font-bold">Popular Locations</h2>
          <div className="space-y-4">
            {popularLocations.map(loc => (
              <div key={loc.name} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{loc.name}</span>
                  <span className="text-[#aa3000]">{loc.value}%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div className={`h-full ${loc.color} rounded-full`} style={{ width: `${loc.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match Success by Category */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] space-y-6">
          <h2 className="font-headline-md text-[20px] font-bold">Match Success by Category</h2>
          <div className="space-y-4">
            {successCategories.map(cat => (
              <div key={cat.name} className="flex items-center justify-between p-4 bg-[#fff8f6] rounded-xl border border-[#ffe9e3]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#aa3000] text-2xl">{cat.icon}</span>
                  <div>
                    <h4 className="font-bold text-[14px] text-[#281712]">{cat.name}</h4>
                    <p className="text-[12px] text-[#5c4037]">{cat.desc}</p>
                  </div>
                </div>
                <span className="font-extrabold text-[18px] text-[#aa3000]">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* High Performance Listings */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] lg:col-span-2 space-y-6">
          <h2 className="font-headline-md text-[20px] font-bold">High Performance Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highPerformers.map(item => (
              <div key={item.title} className="p-4 bg-[#fff8f6] rounded-xl border border-[#ffe9e3] flex flex-col justify-between h-40">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      item.type === 'room' ? 'bg-[#d4e3ff] text-[#005FAC]' : 'bg-[#ffdbd0] text-[#aa3000]'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-[12px] font-bold text-yellow-600 flex items-center gap-0.5">
                      ? {item.rating}
                    </span>
                  </div>
                  <h4 className="font-bold text-[15px] text-[#281712] truncate">{item.title}</h4>
                </div>
                <div className="border-t border-[#ffe9e3] pt-3 flex justify-between text-xs text-[#5c4037] font-semibold">
                  <span>{item.matches} Matches</span>
                  <span>{item.inquiries} Inquiries</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}