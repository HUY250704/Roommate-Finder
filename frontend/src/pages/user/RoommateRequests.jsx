import React, { useEffect, useState } from 'react';
import { Check, Search, UserRoundPlus, X } from 'lucide-react';
import { useStore } from '../../store';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { API_BASE_URL } from '../../config/api';

const avatarFallback = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';

export default function RoommateRequests() {
  const { language } = useStore();
  const isVietnamese = language === 'vi';
  const token = localStorage.getItem('token');
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') || '');
  const [people, setPeople] = useState([]);
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [error, setError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    if (!token) {
      setError(isVietnamese ? 'Vui lòng đăng nhập bằng tài khoản thật để quản lý lời mời.' : 'Sign in with a verified account to manage requests.');
      setLoading(false);
      return () => { isCurrent = false; };
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [peopleResponse, requestResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/roommate-requests/people?search=${encodeURIComponent(search)}`, { headers }),
          fetch(`${API_BASE_URL}/roommate-requests`, { headers }),
        ]);
        const [peopleData, requestData] = await Promise.all([
          peopleResponse.json().catch(() => []),
          requestResponse.json().catch(() => ({})),
        ]);
        if (!peopleResponse.ok) throw new Error(peopleData.message || 'Could not load users');
        if (!requestResponse.ok) throw new Error(requestData.message || 'Could not load roommate requests');
        if (!isCurrent) return;
        setPeople(peopleData);
        setRequests(requestData);
        setError('');
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }, search ? 250 : 0);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [token, search, refreshVersion, isVietnamese]);

  const sendRequest = async (personId) => {
    setWorkingId(personId);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/roommate-requests`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: personId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not send request');
      setRefreshVersion(value => value + 1);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setWorkingId('');
    }
  };

  const respondToRequest = async (requestId, status) => {
    setWorkingId(requestId);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/roommate-requests/${requestId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not update request');
      setRefreshVersion(value => value + 1);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setWorkingId('');
    }
  };

  const sentByPerson = new Map(requests.sent.map(request => [String(request.receiver?._id), request]));
  const receivedByPerson = new Map(requests.received.map(request => [String(request.sender?._id), request]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 font-sans sm:px-6">
      <header className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isVietnamese ? 'Tìm bạn ở ghép' : 'Find roommates'}</h1>
          <p className="mt-1 text-sm text-gray-500">{isVietnamese ? 'Gửi lời mời và duyệt yêu cầu để bắt đầu trò chuyện.' : 'Send and accept requests to unlock messaging.'}</p>
        </div>
        <LanguageSwitcher />
      </header>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="mb-8">
        <h2 className="mb-3 text-base font-bold text-gray-900">{isVietnamese ? 'Tìm người dùng' : 'Discover people'}</h2>
        <label className="relative block max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={isVietnamese ? 'Tìm theo tên tài khoản' : 'Search by username'}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#ab3500]"
          />
        </label>
        {loading ? (
          <p className="mt-4 text-sm text-gray-500">{isVietnamese ? 'Đang tải...' : 'Loading...'}</p>
        ) : people.length ? (
          <div className="mt-3 divide-y divide-gray-100 border-y border-gray-200">
            {people.map(person => {
              const sent = sentByPerson.get(String(person._id));
              const received = receivedByPerson.get(String(person._id));
              const status = sent?.status === 'accepted' || received?.status === 'accepted'
                ? (isVietnamese ? 'Đã kết nối' : 'Connected')
                : received?.status === 'pending'
                  ? (isVietnamese ? 'Có lời mời đang chờ bạn' : 'Incoming request')
                  : sent?.status === 'pending'
                    ? (isVietnamese ? 'Đã gửi lời mời' : 'Request sent')
                    : null;

              return (
                <div key={person._id} className="flex items-center gap-3 py-3">
                  <img src={person.avatar || avatarFallback} alt="" className="h-10 w-10 rounded-full border border-gray-200 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{person.username}</p>
                    {status && <p className="mt-0.5 text-xs text-gray-500">{status}</p>}
                  </div>
                  {!sent && !received && (
                    <button
                      onClick={() => sendRequest(person._id)}
                      disabled={Boolean(workingId)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#ab3500] px-3 py-2 text-xs font-semibold text-white hover:bg-[#8e2800] disabled:opacity-50"
                    >
                      <UserRoundPlus size={14} />
                      {isVietnamese ? 'Gửi lời mời' : 'Request'}
                    </button>
                  )}
                  {received?.status === 'pending' && (
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => respondToRequest(received._id, 'accepted')} disabled={Boolean(workingId)} title={isVietnamese ? 'Chấp nhận' : 'Accept'} className="rounded-md bg-emerald-700 p-2 text-white disabled:opacity-50"><Check size={15} /></button>
                      <button onClick={() => respondToRequest(received._id, 'rejected')} disabled={Boolean(workingId)} title={isVietnamese ? 'Từ chối' : 'Reject'} className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 disabled:opacity-50"><X size={15} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">{isVietnamese ? 'Không tìm thấy người dùng.' : 'No users found.'}</p>
        )}
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-base font-bold text-gray-900">{isVietnamese ? 'Lời mời đã nhận' : 'Received requests'}</h2>
          <div className="divide-y divide-gray-100 border-y border-gray-200">
            {requests.received.length ? requests.received.map(request => (
              <div key={request._id} className="flex items-center gap-3 py-3">
                <img src={request.sender?.avatar || avatarFallback} alt="" className="h-9 w-9 rounded-full border object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{request.sender?.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{request.status}</p>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => respondToRequest(request._id, 'accepted')} disabled={Boolean(workingId)} className="rounded-md bg-emerald-700 p-2 text-white disabled:opacity-50" title={isVietnamese ? 'Chấp nhận' : 'Accept'}><Check size={15} /></button>
                    <button onClick={() => respondToRequest(request._id, 'rejected')} disabled={Boolean(workingId)} className="rounded-md border border-gray-300 p-2 text-gray-600 disabled:opacity-50" title={isVietnamese ? 'Từ chối' : 'Reject'}><X size={15} /></button>
                  </div>
                )}
              </div>
            )) : <p className="py-3 text-sm text-gray-500">{isVietnamese ? 'Chưa có lời mời.' : 'No requests yet.'}</p>}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-base font-bold text-gray-900">{isVietnamese ? 'Lời mời đã gửi' : 'Sent requests'}</h2>
          <div className="divide-y divide-gray-100 border-y border-gray-200">
            {requests.sent.length ? requests.sent.map(request => (
              <div key={request._id} className="flex items-center gap-3 py-3">
                <img src={request.receiver?.avatar || avatarFallback} alt="" className="h-9 w-9 rounded-full border object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{request.receiver?.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{request.status}</p>
                </div>
              </div>
            )) : <p className="py-3 text-sm text-gray-500">{isVietnamese ? 'Bạn chưa gửi lời mời.' : 'No requests sent.'}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
