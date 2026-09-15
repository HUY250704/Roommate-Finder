import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Mail, Lock, LogIn, AlertCircle, X } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../../config/firebase';
import bgImage from '../../assets/bg-image.jpg';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { translations } from '../../utils/translations';

export default function Auth() {
  const { login, loginWithFirebase, language } = useStore();
  const t = translations[language] || translations.vi;
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
          setError(res.message || (language === 'vi' ? 'Đăng nhập Google thất bại' : 'Google sign-in failed'));
        }
      }
    } catch (err) {
      console.warn('Firebase Google Auth error:', err);
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        setShowGoogleInputModal(true);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError(language === 'vi' ? 'Bạn đã đóng cửa sổ đăng nhập Google' : 'Google sign-in window was closed');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError(language === 'vi' ? 'Yêu cầu đăng nhập đã bị hủy' : 'Sign-in request was cancelled');
      } else {
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
      setError(res.message || (language === 'vi' ? 'Đăng nhập thất bại' : 'Login failed'));
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
    <div className="min-h-screen flex bg-[#fff8f6] font-sans relative">
      {/* Left side: Styled Blurred Image banner with Project Name overlay */}
      <div className="hidden lg:block lg:w-[58%] relative overflow-hidden bg-[#281712]">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-[2px] transition-transform duration-1000 hover:scale-105"
          src={imgError ? fallbackImgUrl : bgImage}
          alt="Modern townhouse row"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#aa3000]/60 via-[#281712]/50 to-transparent" />

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
              {language === 'vi'
                ? 'Dễ dàng kết nối bạn cùng phòng lý tưởng và không gian sống hoàn hảo, an toàn và minh bạch.'
                : 'Easily connect with compatible roommates and quality living spaces, securely and transparently.'}
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#ffdbcf]/80">
            <span>✓ {language === 'vi' ? 'Xác thực hồ sơ 100%' : '100% Verified Profiles'}</span>
            <span>✓ {language === 'vi' ? 'Tìm kiếm thông minh' : 'Smart Search & GIS'}</span>
            <span>✓ {language === 'vi' ? 'An toàn & Tiện lợi' : 'Safe & Convenient'}</span>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-[42%] flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto space-y-7">
          <div>
            <h2 className="text-3xl font-extrabold text-[#281712] tracking-tight">
              {language === 'vi' ? 'Đăng nhập tài khoản' : 'Sign in to Account'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {language === 'vi'
                ? 'Chào mừng bạn quay lại hệ thống RoomMate Finder'
                : 'Welcome back to RoomMate Finder Platform'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Social Sign In Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingFirebase}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loadingFirebase ? (language === 'vi' ? 'Đang kết nối...' : 'Connecting...') : (language === 'vi' ? 'Tiếp tục với Google' : 'Continue with Google')}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-[#fff8f6] px-4 text-xs text-gray-500 font-semibold uppercase tracking-wider relative">
              {language === 'vi' ? 'hoặc đăng nhập bằng Email' : 'or login with Email'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#5c4037] mb-2 uppercase tracking-wider">
                {language === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#aa3000] focus:border-transparent outline-none transition text-sm bg-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-[#5c4037] uppercase tracking-wider">
                  {language === 'vi' ? 'Mật khẩu' : 'Password'}
                </label>
                <a href="#forgot" className="text-xs font-bold text-[#aa3000] hover:underline">
                  {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
                </a>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#aa3000] focus:border-transparent outline-none transition text-sm bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#aa3000] hover:bg-[#aa3000]/95 text-white font-bold text-sm shadow-md transition duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              <span>{t.login}</span>
            </button>
          </form>

          {/* Quick Demo Test Accounts Box */}
          <div className="pt-3 border-t border-gray-200 space-y-2.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
              {language === 'vi' ? 'Tài khoản thử nghiệm nhanh (Demo)' : 'Quick Demo Test Accounts'}
            </p>
            <div className="grid grid-cols-2 gap-3">
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

          {/* Bottom Language Switcher */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500">
              {language === 'vi' ? 'Ngôn ngữ:' : 'Language:'}
            </span>
            <LanguageSwitcher />
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
                <h3 className="font-bold text-gray-900 text-base">Đăng nhập với Google</h3>
              </div>
              <button onClick={() => setShowGoogleInputModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
              <p className="font-bold">Lưu ý cấu hình Firebase:</p>
              <p>
                Để bật popup Google tự động, hãy vào <strong>Firebase Console &gt; Authentication &gt; Sign-in method</strong> và kích hoạt nhà cung cấp <strong>Google</strong>.
              </p>
            </div>

            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Google / Gmail của bạn</label>
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên hiển thị</label>
                <input
                  type="text"
                  value={googleCustomName}
                  onChange={(e) => setGoogleCustomName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#aa3000] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleInputModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loadingFirebase || !googleCustomEmail}
                  className="flex-1 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  {loadingFirebase ? "Đang xử lý..." : "Xác nhận đăng nhập"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
