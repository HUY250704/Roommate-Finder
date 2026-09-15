import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Compass, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 font-sans">
      <div className="max-w-lg w-full text-center space-y-6 bg-white/90 backdrop-blur-md p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-150">
        {/* Visual 404 Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center shadow-inner animate-pulse">
            <span className="text-4xl font-extrabold text-[#ab3500]">404</span>
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 bg-[#ab3500] text-white rounded-full shadow-md">
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Không tìm thấy trang yêu cầu
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            Trang hoặc tài nguyên bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc đường dẫn bị thay đổi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Quay lại trang trước</span>
          </button>

          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-[#ab3500] hover:bg-[#8e2800] text-white text-sm font-semibold shadow-lg shadow-orange-900/10 transition flex items-center justify-center gap-2"
          >
            <Home size={16} />
            <span>Về Trang chủ</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-center gap-6 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#ab3500] flex items-center gap-1 font-medium">
            <Search size={13} />
            Tìm phòng trọ
          </Link>
          <Link to="/requests" className="hover:text-[#ab3500] flex items-center gap-1 font-medium">
            <Compass size={13} />
            Tìm bạn ở ghép
          </Link>
        </div>
      </div>
    </div>
  );
}
