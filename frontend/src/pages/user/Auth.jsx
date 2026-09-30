import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { Mail, Lock, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
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
  const fallbackImgUrl = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res?.success) navigate(res.role === 'admin' ? '/admin/dashboard' : '/');
    else setError(res?.message || t.invalidCredentials);
  };

  const handleSocialSignIn = async (provider, providerName) => {
    setError('');
    setLoadingFirebase(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result?.user;
      if (!user) throw new Error('Social sign-in returned no user');

      const response = await loginWithFirebase({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        idToken: await user.getIdToken(),
        providerId: providerName,
      });

      if (response.success) navigate('/');
      else setError(response.message || t.loginFailed);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.warn(`${providerName} sign-in failed:`, err.code, err.message);
        setError(providerName === 'google' ? t.googleFailed : t.loginFailed);
      }
    } finally {
      setLoadingFirebase(false);
    }
  };

  const handleGoogleSignIn = () => handleSocialSignIn(googleProvider, 'google');
  const handleFacebookSignIn = () => handleSocialSignIn(facebookProvider, 'facebook');

  return (
    <div className="min-h-screen flex bg-[#fff8f6] font-sans relative">
      {/* Top Header Controls: Back to Home + Language Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 flex items-center gap-2.5 sm:gap-3">
        <Link
          to="/"
          className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-250 text-xs font-bold text-gray-700 hover:text-[#ab3500] hover:bg-white shadow-sm flex items-center gap-1.5 transition active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>{t.backToHome || (language === 'vi' ? 'Trang chủ' : 'Home')}</span>
        </Link>
        <div className="shadow-sm rounded-full">
          <LanguageSwitcher />
        </div>
      </div>

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
              {t.platformHeroDesc}
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#ffdbcf]/80">
            <span>? {t.verifiedProfiles100}</span>
            <span>? {t.smartSearch}</span>
            <span>? {t.safeAndConvenient}</span>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-[42%] flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-16 py-12 pt-20 lg:pt-12">
        <div className="max-w-md w-full mx-auto space-y-5">
          <div>
            <h2 className="text-3xl font-extrabold text-[#281712] tracking-tight">
              {t.signInTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              {t.welcomeBack}
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
                {t.emailAddress}
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
                  {t.password}
                </label>
                <a href="#forgot" className="text-xs font-bold text-[#aa3000] hover:underline">
                  {t.forgotPassword}
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
                  placeholder="��������"
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

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingFirebase}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loadingFirebase ? t.connecting : t.signInGoogle}
            </button>
            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={loadingFirebase}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loadingFirebase ? t.connecting : t.signInFacebook}
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500">{t.languageLabel}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
