import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Send, ArrowLeft, Search, CheckCheck, Smile, Paperclip, MoreVertical, Sparkles } from 'lucide-react';
import { translations } from '../../utils/translations';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../config/api';

export default function Chat() {
  const navigate = useNavigate();
  const { language } = useStore();
  const t = translations[language] || translations.vi;

  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeContactId, setActiveContactId] = useState('');
  const [authenticatedUserId, setAuthenticatedUserId] = useState('');
  const [inputText, setInputText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const token = localStorage.getItem('token');

  const activeContact = contacts.find(contact => contact.id === activeContactId) || contacts[0] || {
    id: '',
    name: language === 'vi' ? 'Chưa có liên hệ' : 'No contacts yet',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  };

  const filteredMessages = messages.filter(
    message => (activeContact.conversationId && message.conversationId === activeContact.conversationId) || (
      (message.senderId === authenticatedUserId && message.receiverId === activeContactId) ||
      (message.senderId === activeContactId && message.receiverId === authenticatedUserId)
    )
  );

  useEffect(() => {
    let isMounted = true;
    const loadContacts = async () => {
      if (!token) {
        setChatError(language === 'vi'
          ? 'Phiên đăng nhập chưa được xác thực. Vui lòng đăng nhập lại để sử dụng tin nhắn.'
          : 'Your session is not verified. Sign in again to use messaging.');
        setLoadingChats(false);
        return;
      }

      try {
        const profileResponse = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = await profileResponse.json().catch(() => ({}));
        if (!profileResponse.ok) throw new Error(profile.message || 'Please sign in again');
        const userId = String(profile.user?._id || profile.user?.id || '');
        if (!userId) throw new Error('Could not identify the signed-in account');
        if (!isMounted) return;
        setAuthenticatedUserId(userId);

        const response = await fetch(`${API_BASE_URL}/conversations/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(data.message || 'Could not load contacts');
        if (!isMounted) return;
        setContacts(data.map(contact => ({
          ...contact,
          id: String(contact.id),
          avatar: contact.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        })));
        setActiveContactId(currentId => currentId || (data[0] ? String(data[0].id) : ''));
        setChatError('');
      } catch (error) {
        if (isMounted) setChatError(error.message);
      } finally {
        if (isMounted) setLoadingChats(false);
      }
    };

    loadContacts();
    return () => { isMounted = false; };
  }, [token, language]);

  useEffect(() => {
    if (!token || !authenticatedUserId) return undefined;

    const socket = io(API_BASE_URL.replace(/\/api\/?$/, ''), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.on('connect_error', () => {
      setChatError(language === 'vi'
        ? 'Không kết nối được dịch vụ tin nhắn realtime.'
        : 'Could not connect to real-time messaging.');
    });
    socket.on('messageReceived', message => {
      const senderId = String(message.sender?._id || message.sender);
      if (senderId === authenticatedUserId) return;
      const conversationId = String(message.conversation?._id || message.conversation);
      const contactId = senderId;
      const normalized = {
        id: String(message._id),
        conversationId,
        senderId,
        receiverId: contactId,
        text: message.text,
        timestamp: message.createdAt,
      };
      setMessages(existing => existing.some(item => item.id === normalized.id)
        ? existing
        : [...existing, normalized]);
      setContacts(existing => existing.map(contact => (
        contact.id === contactId ? { ...contact, conversationId } : contact
      )));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, authenticatedUserId, language]);

  useEffect(() => {
    let isMounted = true;
    const conversationId = activeContact?.conversationId;
    if (!token || !conversationId) return undefined;

    fetch(`${API_BASE_URL}/conversations/messages/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async response => {
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(data.message || 'Could not load messages');
        return data;
      })
      .then(data => {
        if (!isMounted) return;
        const normalized = data.map(message => {
          const senderId = String(message.sender?._id || message.sender);
          return {
            id: String(message._id),
            conversationId: String(message.conversation),
            senderId,
            receiverId: senderId === authenticatedUserId ? activeContactId : senderId,
            text: message.text,
            timestamp: message.createdAt,
          };
        });
        setMessages(existing => {
          const byId = new Map(existing.map(message => [message.id, message]));
          normalized.forEach(message => byId.set(message.id, message));
          return [...byId.values()];
        });
      })
      .catch(error => {
        if (isMounted) setChatError(error.message);
      });

    return () => { isMounted = false; };
  }, [token, activeContact?.conversationId, activeContactId, authenticatedUserId]);

  // Auto scroll to bottom when new message arrives or contact changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length, activeContactId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !token || !activeContactId || sending) return;
    const textToSend = inputText.trim();
    setSending(true);
    setChatError('');
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: activeContactId,
          text: textToSend,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not send message');

      const conversationId = String(data.conversation?._id || data.conversation);
      const normalized = {
        id: String(data._id),
        conversationId,
        senderId: String(data.sender?._id || authenticatedUserId),
        receiverId: activeContactId,
        text: data.text,
        timestamp: data.createdAt,
      };
      setMessages(existing => existing.some(message => message.id === normalized.id)
        ? existing
        : [...existing, normalized]);
      setContacts(existing => existing.map(contact => (
        contact.id === activeContactId ? { ...contact, conversationId } : contact
      )));
      setInputText('');
    } catch (error) {
      setChatError(error.message);
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter(contact => (
    contact.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchContact.toLowerCase())
  ));

  const formatTime = (ts) => {
    if (!ts) return '10:30';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '10:30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 h-[calc(100vh-90px)] font-sans">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150 h-full flex overflow-hidden">
        
        {/* Sidebar: Contacts List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white shrink-0">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-lg text-gray-900">
                {language === 'vi' ? 'Hộp thư tin nhắn' : 'Messages'}
              </h2>
              <span className="text-xs font-bold bg-orange-50 text-[#ab3500] px-2 py-0.5 rounded-full border border-orange-100">
                {contacts.length} {language === 'vi' ? 'người' : 'contacts'}
              </span>
            </div>

            {/* Search contacts */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder={language === 'vi' ? 'Tìm bạn cùng phòng...' : 'Search conversations...'}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#ab3500] transition"
              />
            </div>
          </div>

          {/* Contact scroll list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredContacts.map(user => {
              const isSelected = activeContactId === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => setActiveContactId(user.id)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-orange-50/70 border-l-4 border-l-[#ab3500]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover border border-gray-200 ring-2 ring-white"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-gray-900 text-sm truncate">{user.name}</div>
                      <span className="text-[10px] text-gray-400">10:30</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">{user.email}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Conversation Area */}
        <div className="flex-1 flex flex-col justify-between bg-[#fafbfc] relative min-w-0">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-150 px-4 py-3 flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => navigate(-1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 md:hidden text-gray-600"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="relative shrink-0">
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{activeContact.name}</h3>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{language === 'vi' ? 'Đang hoạt động' : 'Active now'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(`/roommates/${activeContact.id}`)}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#ab3500] bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200 transition"
                >
                  <Sparkles size={13} />
                  <span>{language === 'vi' ? 'Xem hồ sơ' : 'View Profile'}</span>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Match Helper Sub-Header Banner */}
            <div className="flex items-center justify-between bg-orange-50/60 border border-orange-100 px-3 py-2 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-extrabold text-[#ab3500]">
                  {activeContact.matchScore || 92}% {t.matchScore}:
                </span>
                <span className="text-gray-700 font-medium truncate">
                  {activeContact.id === 'minh'
                    ? (language === 'vi' ? 'Cùng giờ giấc ngủ & sạch sẽ cao' : 'Early Birds & High Cleanliness')
                    : (language === 'vi' ? 'Tương đồng lối sống & ngân sách' : 'Compatible lifestyle & budget')}
                </span>
              </div>
              <button
                onClick={() => navigate(`/roommates/${activeContact.id}`)}
                className="text-[#ab3500] font-bold hover:underline shrink-0 ml-2"
              >
                {language === 'vi' ? 'Chi tiết' : 'Details'}
              </button>
            </div>
          </div>

          {/* Conversation Bubble List */}
          <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4">
            {loadingChats && <p className="text-center text-sm text-gray-500">{language === 'vi' ? 'Đang tải hội thoại...' : 'Loading conversations...'}</p>}
            {chatError && <p role="alert" className="text-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{chatError}</p>}
            {!loadingChats && !contacts.length && !chatError && (
              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-500">{language === 'vi' ? 'Chỉ nhắn tin được với người đã chấp nhận yêu cầu ở ghép.' : 'Messaging is available after a roommate request is accepted.'}</p>
                <button onClick={() => navigate('/requests')} className="text-sm font-semibold text-[#ab3500] hover:underline">
                  {language === 'vi' ? 'Tìm bạn ở ghép' : 'Find roommates'}
                </button>
              </div>
            )}
            <div className="text-center">
              <span className="text-[11px] font-semibold text-gray-400 bg-white border px-3 py-1 rounded-full shadow-2xs">
                {language === 'vi' ? 'Hôm nay' : 'Today'}
              </span>
            </div>

            {filteredMessages.map(msg => {
              const isSelf = msg.senderId === authenticatedUserId;
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                  {!isSelf && (
                    <img
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      className="w-7 h-7 rounded-full object-cover border shrink-0 self-end mb-1"
                    />
                  )}
                  <div className="flex flex-col gap-1 max-w-sm sm:max-w-md">
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                      isSelf
                        ? 'bg-[#ab3500] text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                    }`}>
                      {msg.text}
                    </div>
                    <span className={`text-[10px] text-gray-400 flex items-center gap-1 px-1 ${
                      isSelf ? 'justify-end' : 'justify-start'
                    }`}>
                      {formatTime(msg.timestamp)}
                      {isSelf && <CheckCheck size={12} className="text-[#ab3500]" />}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition hidden sm:flex"
              title="Attach File"
            >
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              placeholder={language === 'vi' ? 'Nhập tin nhắn...' : 'Type a message...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:bg-white focus:border-[#ab3500] focus:ring-2 focus:ring-[#ab3500]/15 transition"
            />
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition hidden sm:flex"
              title="Emoji"
            >
              <Smile size={18} />
            </button>
            <button
              type="submit"
              disabled={!inputText.trim() || sending || !token || !activeContactId}
              className="p-2.5 bg-[#ab3500] hover:bg-[#8e2800] disabled:opacity-50 text-white rounded-full flex items-center justify-center transition active:scale-95 shadow-xs shrink-0 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
