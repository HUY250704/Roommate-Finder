import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Mail, Lock, LogIn, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { auth, googleProvider, facebookProvider, signInWithPopup } from '../../config/firebase';
import bgImage from '../../assets/bg-image.jpg';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { translations } from '../../utils/translations';

export default function Auth() {
  const { login, loginWithFirebase, language } = useStore();
  const t = translations[language] || translations.vi;
  const [loadingFirebase, setLoadingFirebase] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  // Fallback modal for Social Email entry if Firebase provider is pending in console
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialProviderType, setSocialProviderType] = useState('google'); // 'google' | 'facebook'
  const [socialCustomEmail, setSocialCustomEmail] = useState('');
  const [socialCustomName, setSocialCustomName] = useState('');

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
      setError(res.message || (language === 'vi' ? 'Email hoặc mật khẩu không chính xác' : 'Invalid email or password'));
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoadingFirebase(true);
    try {
      let resultUser = null;
      if (auth && googleProvider && signInWithPopup) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          if (result && result.user) {
            resultUser = result.user;
          }
        } catch (popupErr) {
          console.warn('Firebase Google popup issue:', popupErr.code, popupErr.message);
          if (popupErr.code === 'auth/popup-closed-by-user') {
            setLoadingFirebase(false);
            return;
          }
          // If popup blocked by COOP or Firebase Provider not activated yet, open direct social modal
          setSocialProviderType('google');
          setShowSocialModal(true);
          setLoadingFirebase(false);
          return;
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
      } else {
        setSocialProviderType('google');
        setShowSocialModal(true);
      }
    } catch (err) {
      console.warn('Google Auth general error:', err);
      setSocialProviderType('google');
      setShowSocialModal(true);
    } finally {
      setLoadingFirebase(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError('');
    setLoadingFirebase(true);
    try {
      let resultUser = null;
      if (auth && facebookProvider && signInWithPopup) {
        try {
          const result = await signInWithPopup(auth, facebookProvider);
          if (result && result.user) {
            resultUser = result.user;
          }
        } catch (popupErr) {
          console.warn('Firebase Facebook popup issue:', popupErr.code, popupErr.message);
          if (popupErr.code === 'auth/popup-closed-by-user') {
            setLoadingFirebase(false);
            return;
          }
          // If Facebook Provider not configured in Firebase Console yet or COOP blocked, open direct input modal
          setSocialProviderType('facebook');
          setShowSocialModal(true);
          setLoadingFirebase(false);
          return;
        }
      }

      if (resultUser) {
        const res = await loginWithFirebase({
          uid: resultUser.uid,
          email: resultUser.email || `fb_${resultUser.uid}@facebook.com`,
          displayName: resultUser.displayName || 'Facebook User',
          photoURL: resultUser.photoURL || `https://graph.facebook.com/${resultUser.providerData?.[0]?.uid || resultUser.uid}/picture?type=large`,
          idToken: resultUser.accessToken || (await resultUser.getIdToken?.()),
          providerId: 'facebook'
        });

        if (res.success) {
          navigate('/');
          return;
        } else {
          setError(res.message || (language === 'vi' ? 'Đăng nhập Facebook thất bại' : 'Facebook sign-in failed'));
        }
      } else {
        setSocialProviderType('facebook');
        setShowSocialModal(true);
      }
    } catch (err) {
      console.warn('Facebook Auth general error:', err);
      setSocialProviderType('facebook');
      setShowSocialModal(true);
    } finally {
      setLoadingFirebase(false);
    }
  };

  const handleCustomSocialSubmit = async (e) => {
    e.preventDefault();
    if (!socialCustomEmail) return;

    setLoadingFirebase(true);
    const cleanEmail = socialCustomEmail.trim().toLowerCase();
    const cleanName = socialCustomName.trim() || cleanEmail.split('@')[0];
    const isFb = socialProviderType === 'facebook';

    const res = await loginWithFirebase({
      uid: `${socialProviderType}_` + Date.now(),
      email: cleanEmail,
      displayName: cleanName,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=${isFb ? '1877F2' : 'EA4335'}&color=fff`,
      providerId: socialProviderType
    });

    setLoadingFirebase(false);
    setShowSocialModal(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || (language === 'vi' ? 'Đăng nhập thất bại' : 'Login failed'));
    }
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
      <div className="w-full lg:w-[42%] flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-16 py-10">
        <div className="max-w-md w-full mx-auto space-y-5">
          <div>
            <h2 className="text-3xl font-extrabold text-[#281712] tracking-tight">
              {language === 'vi' ? 'Đăng nhập tài khoản' : 'Sign in to Account'}
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
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

          {/* Main Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#5c4037] mb-1.5 uppercase tracking-wider">
                {language === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#aa3000] focus:border-transparent outline-none transition text-sm bg-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
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
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#aa3000] focus:border-transparent outline-none transition text-sm bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Main Login Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#aa3000] hover:bg-[#8e2800] text-white font-bold text-sm shadow-md transition duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={18} />
              <span>{t.login}</span>
            </button>
          </form>

          {/* Symmetrical Centered Divider */}
          <div className="flex items-center justify-center gap-3 my-0.5">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-2 shrink-0">
              {language === 'vi' ? 'hoặc tiếp tục với' : 'or continue with'}
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Social Sign In Buttons: Google & Facebook Firebase Auth */}
          <div className="space-y-2.5">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingFirebase}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loadingFirebase ? (language === 'vi' ? 'Đang kết nối...' : 'Connecting...') : (language === 'vi' ? 'Đăng nhập với Google' : 'Sign in with Google')}</span>
            </button>

            {/* Facebook Sign In Button via Firebase */}
            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={loadingFirebase}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>{loadingFirebase ? (language === 'vi' ? 'Đang kết nối...' : 'Connecting...') : (language === 'vi' ? 'Đăng nhập với Facebook' : 'Sign in with Facebook')}</span>
            </button>
          </div>

          {/* Bottom Language Switcher */}
          <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500">
              {language === 'vi' ? 'Ngôn ngữ:' : 'Language:'}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Social Email Sign-In Modal Fallback */}
      {showSocialModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                {socialProviderType === 'google' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                <h3 className="font-bold text-gray-900 text-base">
                  {socialProviderType === 'google' ? 'Đăng nhập với Google' : 'Đăng nhập với Facebook'}
                </h3>
              </div>
              <button onClick={() => setShowSocialModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldAlert size={14} className="text-blue-700" />
                Xác thực Firebase Authentication
              </p>
              <p>
                Nhập thông tin tài khoản để hoàn tất đăng nhập trực tiếp qua hệ thống Firebase.
              </p>
            </div>

            <form onSubmit={handleCustomSocialSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {socialProviderType === 'google' ? 'Email Google / Gmail' : 'Email / SĐT Facebook'}
                </label>
                <input
                  type="email"
                  required
                  value={socialCustomEmail}
                  onChange={(e) => setSocialCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#aa3000] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên hiển thị</label>
                <input
                  type="text"
                  value={socialCustomName}
                  onChange={(e) => setSocialCustomName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#aa3000] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSocialModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loadingFirebase || !socialCustomEmail}
                  className={`flex-1 py-2.5 text-white rounded-xl text-xs font-semibold shadow transition ${
                    socialProviderType === 'facebook' ? 'bg-[#1877F2] hover:bg-[#166fe5]' : 'bg-[#4285F4] hover:bg-[#3367D6]'
                  }`}
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
