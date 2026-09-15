import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Send, ArrowLeft, Search, CheckCheck, Smile, Paperclip, MoreVertical, Sparkles } from 'lucide-react';
import { translations } from '../../utils/translations';

export default function Chat() {
  const navigate = useNavigate();
  const { messages, sendMessage, currentUser, users, language } = useStore();
  const t = translations[language] || translations.vi;

  const [activeContactId, setActiveContactId] = useState('minh');
  const [inputText, setInputText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const messagesEndRef = useRef(null);

  const activeContact = users.find(u => u.id === activeContactId) || users[0];

  const filteredMessages = messages.filter(
    m => (m.senderId === currentUser?.id && m.receiverId === activeContactId) ||
         (m.senderId === activeContactId && m.receiverId === currentUser?.id)
  );

  // Auto scroll to bottom when new message arrives or contact changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length, activeContactId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    sendMessage(activeContactId, textToSend);
    setInputText('');

    // Simulate real-time bot / roommate reply after 1.2s for interactive demo
    if (activeContactId === 'minh' || activeContactId === 'david') {
      setTimeout(() => {
        const repliesVi = [
          'Chào bạn! Mình nhận được tin nhắn rồi, phòng vẫn đang còn nhé!',
          'Cuối tuần này bạn có rảnh qua xem phòng trực tiếp không?',
          'Tuyệt vời, lối sống của tụi mình rất hợp nhau đấy!',
          'Ok bạn nhé, có gì nhắn lại mình nhé.'
        ];
        const repliesEn = [
          'Hey there! I got your message, the room is still available!',
          'Are you free this weekend to come and view the place?',
          'Awesome, looks like our lifestyles match really well!',
          'Sounds great, let me know if you need any more details.'
        ];
        const list = language === 'vi' ? repliesVi : repliesEn;
        const randomReply = list[Math.floor(Math.random() * list.length)];
        sendMessage(currentUser?.id || 'sarah', randomReply);
      }, 1200);
    }
  };

  const contacts = users
    .filter(u => u.id !== currentUser?.id && u.role !== 'admin')
    .filter(u => u.name.toLowerCase().includes(searchContact.toLowerCase()) || 
                 (u.occupation && u.occupation.toLowerCase().includes(searchContact.toLowerCase())));

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
            {contacts.map(user => {
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
                    <div className="text-xs text-gray-500 truncate mt-0.5">{user.occupation || user.intro}</div>
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
            <div className="text-center">
              <span className="text-[11px] font-semibold text-gray-400 bg-white border px-3 py-1 rounded-full shadow-2xs">
                {language === 'vi' ? 'Hôm nay' : 'Today'}
              </span>
            </div>

            {filteredMessages.map(msg => {
              const isSelf = msg.senderId === currentUser?.id;
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
              disabled={!inputText.trim()}
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
