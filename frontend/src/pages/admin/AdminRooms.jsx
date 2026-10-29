import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { API_BASE_URL } from '../../config/api';
import { authenticatedFetch } from '../../utils/authenticatedFetch';
import { translations } from '../../utils/translations';

const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';

const readApiResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

export default function AdminRooms() {
  const { language } = useStore();
  const t = translations[language] || translations.vi;
  const [rooms, setRooms] = useState([]);
  const [reportCounts, setReportCounts] = useState({});
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingRoomId, setSavingRoomId] = useState(null);

  useEffect(() => {
    let active = true;

    const loadListings = async () => {
      try {
        const [roomsResponse, reportsResponse] = await Promise.all([
          authenticatedFetch(`${API_BASE_URL}/admin/rooms?status=all`),
          authenticatedFetch(`${API_BASE_URL}/admin/reports?status=pending`),
        ]);
        const [roomData, reportData] = await Promise.all([
          readApiResponse(roomsResponse),
          readApiResponse(reportsResponse),
        ]);

        if (!Array.isArray(roomData) || !Array.isArray(reportData)) {
          throw new Error('The server returned an invalid listing response');
        }

        if (active) {
          setRooms(roomData.map(room => ({
            ...room,
            id: room._id,
            image: room.images?.[0] || DEFAULT_ROOM_IMAGE,
            ownerName: room.owner?.username || room.owner?.email || '—',
          })));
          setReportCounts(reportData.reduce((counts, report) => {
            const roomId = report.reportedRoom?._id || report.reportedRoom;
            if (roomId) counts[roomId] = (counts[roomId] || 0) + 1;
            return counts;
          }, {}));
        }
      } catch (loadError) {
        if (active) setError(loadError.message || t.loadListingsFailed);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadListings();
    return () => {
      active = false;
    };
  }, [t.loadListingsFailed]);

  const filteredRooms = rooms.filter(room => {
    if (filter === 'Pending') return room.status === 'pending';
    if (filter === 'Reported') return Boolean(reportCounts[room.id]);
    return true;
  });

  const handleStatusChange = async (roomId, status) => {
    setError('');
    setSavingRoomId(roomId);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/admin/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await readApiResponse(response);
      setRooms(currentRooms => currentRooms.map(room => (
        room.id === roomId ? { ...room, status } : room
      )));
    } catch (updateError) {
      setError(updateError.message || t.updateListingFailed);
    } finally {
      setSavingRoomId(null);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm(t.confirmDeleteListing)) return;

    setError('');
    setSavingRoomId(roomId);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/admin/rooms/${roomId}`, {
        method: 'DELETE',
      });
      await readApiResponse(response);
      setRooms(currentRooms => currentRooms.filter(room => room.id !== roomId));
    } catch (deleteError) {
      setError(deleteError.message || t.deleteListingFailed);
    } finally {
      setSavingRoomId(null);
    }
  };

  const reportedRoomsCount = rooms.filter(room => reportCounts[room.id]).length;
  const activeRoomsCount = rooms.filter(room => ['approved', 'available'].includes(room.status)).length;
  const filters = [
    { value: 'All', label: t.allListings },
    { value: 'Pending', label: t.pending },
    { value: 'Reported', label: t.reported },
  ];

  return (
    <div className="p-8 space-y-8 bg-[#fff8f6] min-h-screen font-sans text-[#281712]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display-lg text-[32px] md:text-[40px] font-extrabold tracking-tight">{t.adminRoomsTitle}</h2>
          <p className="font-body-md text-[16px] text-[#5c4037]">{t.adminRoomsSubtitle}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-full p-2 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3]">
          {filters.map(({ value, label }) => {
            const isSel = filter === value;
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-6 py-2 rounded-full font-label-md text-[12px] font-bold transition-all active:scale-95 ${
                  isSel ? 'bg-[#aa3000] text-white shadow-sm' : 'text-[#5c4037] hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Cards Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#ffe9e3] rounded-full text-[#aa3000]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                pending_actions
              </span>
            </div>
            <span className="bg-[#aa3000]/10 text-[#aa3000] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">{t.pending}</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">{rooms.filter(room => room.status === 'pending').length}</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">{t.pendingApprovals}</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 rounded-full text-[#005FAC]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                apartment
              </span>
            </div>
            <span className="bg-blue-100 text-[#005FAC] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">{rooms.length}</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">{activeRoomsCount}</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">{t.activeListings}</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 rounded-full text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
            </div>
            <span className="bg-red-100 text-[#ba1a1a] px-3 py-1 rounded-full font-label-md text-[12px] font-bold">{t.needsAction}</span>
          </div>
          <div>
            <h3 className="font-display-lg text-[28px] font-extrabold text-[#281712] mb-1">{reportedRoomsCount}</h3>
            <p className="font-body-md text-[14px] text-[#5c4037]">{t.reportedListings}</p>
          </div>
        </div>
      </div>

      {/* Listings Table Layout */}
      <div className="bg-white rounded-[24px] shadow-[0_10px_40px_0px_rgba(255,77,0,0.04)] border border-[#ffe9e3] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-[#ffe9e3] text-xs font-bold uppercase tracking-wider text-[#5c4037]">
          <div className="col-span-5 md:col-span-4">{t.roomDetails}</div>
          <div className="hidden md:block col-span-2">{t.owner}</div>
          <div className="hidden md:block col-span-2">{t.locationLabel}</div>
          <div className="col-span-3 md:col-span-1 text-right">{t.price}</div>
          <div className="col-span-4 md:col-span-3 text-right">{t.actions}</div>
        </div>

        {error && (
          <div role="alert" className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="divide-y divide-[#ffe9e3]">
          {loading && (
            <p className="px-6 py-8 text-center text-[#5c4037]">{t.loadingListings}</p>
          )}
          {!loading && !error && filteredRooms.length === 0 && (
            <p className="px-6 py-8 text-center text-[#5c4037]">{t.noListingsFound}</p>
          )}
          {filteredRooms.map(room => (
            <div
              key={room.id}
              className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors hover:bg-gray-50 ${
                filter === 'Reported' ? 'bg-red-50/50' : ''
              }`}
            >
              {/* Room details */}
              <div className="col-span-5 md:col-span-4 flex items-center gap-4">
                <img
                  className="w-16 h-16 rounded-xl object-cover shadow-sm border border-[#ffe9e3] flex-shrink-0"
                  alt={room.title}
                  src={room.image}
                />
                <div className="min-w-0">
                  <h4 className="font-headline-sm text-[16px] text-[#281712] font-bold truncate">{room.title}</h4>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    ['approved', 'available'].includes(room.status) ? 'bg-green-100 text-green-700' :
                      room.status === 'rejected' || room.status === 'removed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                  }`}>
                    {room.status}
                  </span>
                  {reportCounts[room.id] > 0 && (
                    <span className="ml-1 inline-block mt-1 rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700" title={t.pendingRoomReports}>
                      {reportCounts[room.id]} {t.reported}
                    </span>
                  )}
                </div>
              </div>

              {/* Owner */}
              <div className="hidden md:flex col-span-2 items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#ffdbcf] flex items-center justify-center text-[#aa3000] font-label-md text-[10px] font-bold">
                  {room.ownerName?.substring(0, 2).toUpperCase() || '—'}
                </div>
                <span className="font-body-md text-[14px] text-[#5c4037] truncate">{room.ownerName}</span>
              </div>

              {/* Location */}
              <div className="hidden md:block col-span-2">
                <span className="font-body-md text-[13px] text-[#5c4037] truncate flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
                  {room.location}
                </span>
              </div>

              {/* Price */}
              <div className="col-span-3 md:col-span-1 text-right font-bold text-[#aa3000] text-[15px]">
                {room.price >= 1000000 ? `${(room.price / 1000000).toFixed(1)}M` : room.price.toLocaleString()}
              </div>

              {/* Actions */}
              <div className="col-span-4 md:col-span-3 flex justify-end gap-2">
                {room.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusChange(room.id, 'approved')}
                    disabled={savingRoomId === room.id}
                    className="p-2 rounded-full text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                    title={t.approve}
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                  </button>
                )}
                {room.status === 'approved' && (
                  <button
                    onClick={() => handleStatusChange(room.id, 'pending')}
                    disabled={savingRoomId === room.id}
                    className="p-2 rounded-full text-yellow-600 hover:bg-yellow-50 transition-colors disabled:opacity-50"
                    title={t.revokeApproval}
                  >
                    <span className="material-symbols-outlined">cancel</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(room.id)}
                  disabled={savingRoomId === room.id}
                  className="p-2 rounded-full text-[#ba1a1a] hover:bg-red-50 transition-colors disabled:opacity-50"
                  title={t.deleteListing}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}