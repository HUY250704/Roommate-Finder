import React from 'react';
import { useStore } from '../../store';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage } = useStore();

  return (
    <div className={`inline-flex items-center rounded-full bg-gray-100 p-0.5 border border-gray-200 text-xs font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        aria-label="Tiếng Việt"
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-150 ${
          language === 'vi'
            ? 'bg-[#ab3500] text-white shadow-xs font-bold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <span className="text-[12px]">🇻🇳</span>
        <span>VI</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-label="English"
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-150 ${
          language === 'en'
            ? 'bg-[#ab3500] text-white shadow-xs font-bold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <span className="text-[12px]">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
