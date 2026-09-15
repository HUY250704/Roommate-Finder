import React from 'react';
import { useStore } from '../../store';

export default function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage } = useStore();

  return (
    <div className={`inline-flex items-center rounded-full bg-white/95 backdrop-blur-md p-1 shadow-sm border border-gray-250 select-none ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        aria-label="Tiếng Việt"
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer text-xs font-bold ${
          language === 'vi'
            ? 'bg-[#ab3500] text-white shadow-md scale-105'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <span className="text-[14px]">🇻🇳</span>
        <span className="tracking-wide text-xs">VI</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-label="English"
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer text-xs font-bold ${
          language === 'en'
            ? 'bg-[#ab3500] text-white shadow-md scale-105'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <span className="text-[14px]">🇬🇧</span>
        <span className="tracking-wide text-xs">EN</span>
      </button>
    </div>
  );
}
