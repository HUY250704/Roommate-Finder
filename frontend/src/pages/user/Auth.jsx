import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../../config/firebase';


export default function Auth() {
  const { login, loginWithFirebase } = useStore();
  const [loadingFirebase, setLoadingFirebase] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(email, password);
    if (res.success) {
      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
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
          className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-[2px] transition-transform duration-[10000ms] hover:scale-105"
          src={imgError ? fallbackImgUrl : '/src/assets/login-banner.jpg'}
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
            <p className="font-body-lg text-[22px] text-[#ffdbcf] leading-relaxed drop-shadow-md">
              Find your ideal co-living space and connect with roommates who match your vibe, schedule, and lifestyle habits.
            </p>
          </div>

          <div className="text-[14px] text-[#ffdbcf]/60">
            &copy; {new Date().getFullYear()} Roommate Finder. Professional Co-Living Solutions.
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-[42%] flex items-center justify-center p-8 sm:p-12 md:p-16 bg-white shadow-2xl relative z-10 border-l border-[#e6beb2]/30">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-[#281712] tracking-tight">
              Sign in
            </h2>
            <p className="mt-2 text-base text-[#5c4037]">
              Enter your credentials to access your personal dashboard.
            </p>
          </div>

          {/* Autofill test area */}
          <div className="bg-[#FFF0EA] p-4 rounded-2xl border border-[#ffe9e3] space-y-2">
            <p className="text-sm font-bold text-[#aa3000] uppercase tracking-wider">Demo Accounts</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => autofill('user')}
                className="flex-1 py-2 px-3 bg-white text-[#aa3000] border border-[#e6beb2] rounded-xl text-sm font-bold hover:bg-gray-50 transition"
              >
                Sign in as User
              </button>
              <button
                type="button"
                onClick={() => autofill('admin')}
                className="flex-1 py-2 px-3 bg-[#aa3000] text-white rounded-xl text-sm font-bold hover:bg-[#aa3000]/95 transition"
              >
                Sign in as Admin
              </button>
            </div>
          </div>

          
          {/* Google Sign-In */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                setLoadingFirebase(true);
                setError("");
                const res = await loginWithFirebase({
                  uid: "google_" + Date.now(),
                  email: "google.user@gmail.com",
                  name: "Google User",
                  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAW5tXAl29HfLPgJzezpubAmN60dyoEReg0lrpGTvaY6rG4UhV6uOgId7Pan-Kiof5Yr8OmzRf_xNF7NaCs0ZU2zxopGnPKuCswUWKob9LxYT3cKw7KdFuABoZQPvrg0GqXIKdLj4Jk2t4fgBnIT3liWZ5ItXuvtJuBw_5Cn-7zUg8nDA9W1o30g_F3h7F_r7kUuQKDds2C-clINixwEqHyxovo4eIXuvZR3xZMxZ1TWN1ywSodwwg"
                });
                setLoadingFirebase(false);
                if (res.success) navigate("/");
                else setError(res.message || "��ng nh?p Google th?t b?i");
              }}
              disabled={loadingFirebase}
              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 text-gray-700 font-semibold transition flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loadingFirebase ? "�ang x? l?..." : "Sign in with Firebase Auth"}</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-gray-400">or sign in with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {error && (
            <div className="bg-red-50 text-[#ba1a1a] p-4 rounded-xl flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-[#5c4037] uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#aa3000] text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5c4037] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#aa3000] text-base"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-[#aa3000] hover:bg-[#aa3000]/95 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" /> Sign In
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}