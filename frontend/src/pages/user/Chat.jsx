import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function Chat() {
  const navigate = useNavigate();
  const { messages, sendMessage, currentUser, users } = useStore();

  const [activeContactId, setActiveContactId] = useState('minh');
  const [inputText, setInputText] = useState('');

  const activeContact = users.find(u => u.id === activeContactId) || users[0];

  const filteredMessages = messages.filter(
    m => (m.senderId === currentUser?.id && m.receiverId === activeContactId) ||
         (m.senderId === activeContactId && m.receiverId === currentUser?.id)
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeContactId, inputText);
    setInputText('');
  };

  const contacts = users.filter(u => u.id !== currentUser?.id && u.role !== 'admin');

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 h-[calc(100vh-120px)] font-sans">
      <div className="bg-white rounded-xl shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-150 h-full flex overflow-hidden">
        
        {/* Sidebar: Contacts List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100 font-bold text-[18px] text-[#191c1d]">Chats</div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map(user => (
              <button
                key={user.id}
                onClick={() => setActiveContactId(user.id)}
                className={`w-full p-4 flex items-center gap-3 border-b border-gray-50 text-left transition-colors ${
                  activeContactId === user.id ? 'bg-[#ab3500]/5' : 'hover:bg-gray-50'
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{user.name}</div>
                  <div className="text-xs text-gray-500 truncate">{user.occupation}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Conversation Area */}
        <div className="flex-1 flex flex-col justify-between bg-[#f8f9fa] relative">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-150 p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-1 rounded-full hover:bg-gray-100 md:hidden"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="relative">
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{activeContact.name}</h4>
                  <p className="text-xs text-green-600 font-medium">Online</p>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <span className="material-symbols-outlined text-gray-500">more_vert</span>
              </button>
            </div>

            {/* Match Helper Sub-Header Widget */}
            <div className="flex items-center justify-between bg-[#ab3500]/5 border border-[#ab3500]/10 p-3 rounded-xl mt-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[14px] text-[#ab3500]">
                  {activeContact.matchScore || 90}% Match:
                </span>
                <span className="text-[13px] text-[#594139] font-medium">
                  {activeContact.id === 'minh' ? 'Early Birds & Clean Freaks' : 'Shared Interests'}
                </span>
              </div>
              <button
                onClick={() => navigate(`/roommates/${activeContact.id}`)}
                className="text-[12px] font-bold text-[#ab3500] hover:underline"
              >
                Details
              </button>
            </div>
          </div>

          {/* Conversation Bubble List */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            <div className="text-center text-xs text-gray-400 my-2">Today, 10:42 AM</div>
            {filteredMessages.map(msg => {
              const isSelf = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`flex gap-3 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                  {!isSelf && (
                    <img
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      className="w-8 h-8 rounded-full object-cover border self-end"
                    />
                  )}
                  <div className={`max-w-md px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    isSelf
                      ? 'bg-[#ab3500] text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none border border-gray-150'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-full text-[14px] focus:outline-none focus:border-[#ab3500] transition-colors"
            />
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">mood</span>
            </button>
            <button
              type="submit"
              className="p-3 bg-[#ab3500] hover:bg-[#ab3500]/95 text-white rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}