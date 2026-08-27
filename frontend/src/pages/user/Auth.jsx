import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';


export default function Auth() {
  const { login } = useStore();
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
            <span className="material-symbols-outlined text-[#ffdbcf] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              home_pin
            </span>
            <span className="text-[20px] font-extrabold tracking-wider uppercase text-[#ffdbcf]">RoomMate Platform</span>
          </div>

          <div className="max-w-xl space-y-4">
            <h1 className="font-display-lg text-[48px] font-extrabold tracking-tight leading-none text-white drop-shadow-lg">
              RoomMate <span className="text-[#ffdbcf]">Finder</span>
            </h1>
            <p className="font-body-lg text-[18px] text-[#ffdbcf] leading-relaxed drop-shadow-md">
              Find your ideal co-living space and connect with roommates who match your vibe, schedule, and lifestyle habits.
            </p>
          </div>

          <div className="text-[12px] text-[#ffdbcf]/60">
            &copy; {new Date().getFullYear()} Roommate Finder. Professional Co-Living Solutions.
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-[42%] flex items-center justify-center p-8 sm:p-12 md:p-16 bg-white shadow-2xl relative z-10 border-l border-[#e6beb2]/30">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#281712] tracking-tight">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-[#5c4037]">
              Enter your credentials to access your personal dashboard.
            </p>
          </div>

          {/* Autofill test area */}
          <div className="bg-[#FFF0EA] p-4 rounded-2xl border border-[#ffe9e3] space-y-2">
            <p className="text-xs font-bold text-[#aa3000] uppercase tracking-wider">Demo Accounts</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => autofill('user')}
                className="flex-1 py-2 px-3 bg-white text-[#aa3000] border border-[#e6beb2] rounded-xl text-xs font-bold hover:bg-gray-50 transition"
              >
                Sign in as User
              </button>
              <button
                type="button"
                onClick={() => autofill('admin')}
                className="flex-1 py-2 px-3 bg-[#aa3000] text-white rounded-xl text-xs font-bold hover:bg-[#aa3000]/95 transition"
              >
                Sign in as Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-[#ba1a1a] p-4 rounded-xl flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#5c4037] uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#aa3000] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5c4037] uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#aa3000] text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#aa3000] hover:bg-[#aa3000]/95 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" /> Sign In
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}