import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-sm z-50 bg-white rounded-2xl p-4 shadow-2xl border border-orange-200 animate-slideUp flex items-center gap-3.5">
      <div className="w-12 h-12 rounded-xl bg-[#ab3500] text-white flex items-center justify-center shrink-0 shadow-md">
        <span className="material-symbols-outlined text-2xl">home_pin</span>
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-xs text-gray-900">Cài đặt Roommate Finder</h4>
        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
          Trải nghiệm ứng dụng mượt mà, hỗ trợ offline & thông báo nhanh.
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-[#ab3500] hover:bg-[#8e2800] text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1"
          >
            <Download size={13} />
            <span>Cài đặt ngay</span>
          </button>
          <button
            onClick={handleDismiss}
            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition"
          >
            Để sau
          </button>
        </div>
      </div>
      <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 self-start">
        <X size={16} />
      </button>
    </div>
  );
}
