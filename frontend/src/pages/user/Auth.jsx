import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Mail, Lock, LogIn, AlertCircle, X, CheckCircle, ExternalLink } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../../config/firebase';
import bgImage from '../../assets/bg-image.jpg';

export default function Auth() {
  const { login, loginWithFirebase } = useStore();
  const [loadingFirebase, setLoadingFirebase] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  // Fallback modal for Google Email entry if Firebase provider is disabled in console
  const [showGoogleInputModal, setShowGoogleInputModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res && res.success) {
      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoadingFirebase(true);
    try {
      let resultUser = null;
      if (auth && googleProvider && signInWithPopup) {
        const result = await signInWithPopup(auth, googleProvider);
        if (result && result.user) {
          resultUser = result.user;
        }
      }

      if (resultUser) {
        const res = await loginWithFirebase({
          uid: resultUser.uid,
          email: resultUser.email,
          displayName: resultUser.displayName || resultUser.email?.split('@')[0],
          photoURL: resultUser.photoURL,
          idToken: resultUser.accessToken || (await resultUser.getIdToken?.()),
          providerId: 'google'
        });

        if (res.success) {
          navigate('/');
          return;
        } else {
          setError(res.message || 'Ðãng nh?p Google th?t b?i');
        }
      }
    } catch (err) {
      console.warn('Firebase Google Auth error:', err);
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        // Firebase project has not enabled Google Sign-in in console yet
        // Open the custom Google login dialog so user can enter their real email!
        setShowGoogleInputModal(true);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('B?n ð? ðóng c?a s? ðãng nh?p Google');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Yêu c?u ðãng nh?p ð? b? h?y');
      } else {
        // Offer custom Google email login modal
        setShowGoogleInputModal(true);
      }
    } finally {
      setLoadingFirebase(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleCustomEmail) return;

    setLoadingFirebase(true);
    const cleanEmail = googleCustomEmail.trim().toLowerCase();
    const cleanName = googleCustomName.trim() || cleanEmail.split('@')[0];

    const res = await loginWithFirebase({
      uid: 'google_' + Date.now(),
      email: cleanEmail,
      displayName: cleanName,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=ea4335&color=fff`,
      providerId: 'google'
    });

    setLoadingFirebase(false);
    setShowGoogleInputModal(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Ðãng nh?p th?t b?i');
    }
  };

  const autofill = (type) => {
    if (type === 'user') {
      setEmail('sarah@example.com');
    } else {
      setEmail('admin@roommate.com');
    }
    setPassword('123456');
  };

  const fallbackImgUrl = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000";

  return (
    <div className="min-h-screen flex bg-[#fff8f6] font-sans">
      
      {/* Left side: Styled Blurred Image banner with Project Name overlay */}
      <div className="hidden lg:block lg:w-[58%] relative overflow-hidden bg-[#281712]">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-[2px] transition-transform duration-1000 hover:scale-105"
          src={imgError ? fallbackImgUrl : bgImage}
          alt="Modern townhouse row"
          onError={() => setImgError(true)}
        />
        {/* Soft color overlay matching the design palette */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#aa3000]/60 via-[#281712]/50 to-transparent" />

        {/* Center overlay container for brand title */}
        <div className="absolute inset-0 flex flex-col justify-between p-16 text-white z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffdbcf] text-[42px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              home_pin
            </span>
            <span className="text-[26px] font-extrabold tracking-wider uppercase text-[#ffdbcf]">RoomMate Platform</span>
          </div>

          <div className="max-w-xl space-y-4">
            <h1 className="font-display-lg text-[64px] font-extrabold tracking-tight leading-none text-white drop-shadow-lg">
              RoomMate <span className="text-[#ffdbcf]">Finder</span>
            </h1>
            <p className="text-[#ffdbcf]/90 text-lg max-w-md font-light leading-relaxed">
              D? dàng k?t n?i b?n cùng ph?ng l? tý?ng và không gian s?ng hoàn h?o, an toàn và minh b?ch.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#ffdbcf]/80">
            <span>? Xác th?c h? sõ 100%</span>
            <span>? T?m ki?m thông minh</span>
            <span>? An toàn & Ti?n l?i</span>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-[42%] flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#281712] tracking-tight">Ðãng nh?p tài kho?n</h2>
            <p className="text-sm text-gray-500 mt-2">Chào m?ng b?n quay l?i h? th?ng RoomMate Finder</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa3000]/20 focus:border-[#aa3000] text-sm text-gray-800 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">M?t kh?u</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#aa3000]/20 focus:border-[#aa3000] text-sm text-gray-800 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#aa3000] focus:ring-[#aa3000]" />
                <span>Ghi nh? ðãng nh?p</span>
              </label>
              <a href="#forgot" className="text-[#aa3000] hover:underline font-medium">Quên m?t kh?u?</a>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#aa3000] hover:bg-[#8e2800] text-white font-semibold rounded-xl shadow-lg shadow-[#aa3000]/20 transition flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              <span>Ðãng nh?p</span>
              <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Real Google / Firebase Auth Button */}
          <div className="space-y-3">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Ho?c ðãng nh?p v?i</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingFirebase}
              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 text-gray-700 font-semibold transition flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loadingFirebase ? "Ðang k?t n?i Google..." : "Ðãng nh?p v?i Google"}</span>
            </button>
          </div>

          {/* Quick autofill for demo */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-2.5">Demo tài kho?n nhanh:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => autofill('user')}
                className="text-left px-3 py-2 bg-gray-50 hover:bg-[#ffe9e3] hover:border-[#aa3000]/30 border border-gray-100 rounded-xl transition text-xs group"
              >
                <div className="font-semibold text-gray-800 group-hover:text-[#aa3000]">User Test</div>
                <div className="text-[11px] text-gray-500">sarah@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => autofill('admin')}
                className="text-left px-3 py-2 bg-gray-50 hover:bg-[#ffe9e3] hover:border-[#aa3000]/30 border border-gray-100 rounded-xl transition text-xs group"
              >
                <div className="font-semibold text-gray-800 group-hover:text-[#aa3000]">Admin Test</div>
                <div className="text-[11px] text-gray-500">admin@roommate.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Google Email Sign-In Modal Fallback */}
      {showGoogleInputModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 className="font-bold text-gray-900 text-base">Ðãng nh?p v?i Google</h3>
              </div>
              <button onClick={() => setShowGoogleInputModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
              <p className="font-bold">Lýu ? c?u h?nh Firebase:</p>
              <p>
                Ð? b?t popup Google t? ð?ng, h?y vào <strong>Firebase Console &gt; Authentication &gt; Sign-in method</strong> và kích ho?t nhà cung c?p <strong>Google</strong>.
              </p>
            </div>

            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Google / Gmail c?a b?n</label>
                <input
                  type="email"
                  required
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#aa3000] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">H? và tên hi?n th?</label>
                <input
                  type="text"
                  value={googleCustomName}
                  onChange={(e) => setGoogleCustomName(e.target.value)}
                  placeholder="Ví d?: Nguy?n Vãn A"
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#aa3000] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleInputModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  H?y
                </button>
                <button
                  type="submit"
                  disabled={loadingFirebase || !googleCustomEmail}
                  className="flex-1 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  {loadingFirebase ? "Ðang x? l?..." : "Xác nh?n ðãng nh?p"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
