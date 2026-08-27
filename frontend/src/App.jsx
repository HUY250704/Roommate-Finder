import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useStore } from './store';

// Layouts
import UserNavbar from './components/layout/UserNavbar';
import AdminSidebar from './components/layout/AdminSidebar';
import bgImage from './assets/bg-image.jpg';

// User Pages
import UserHome from './pages/user/UserHome';
import RoomDetails from './pages/user/RoomDetails';
import RoommateProfile from './pages/user/RoommateProfile';
import Profile from './pages/user/Profile';
import RoommateRequests from './pages/user/RoommateRequests';
import SavedRooms from './pages/user/SavedRooms';
import Chat from './pages/user/Chat';
import Auth from './pages/user/Auth';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRooms from './pages/admin/AdminRooms';
import AdminReports from './pages/admin/AdminReports';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// User Layout wrapper
function UserLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans relative overflow-hidden">
      {/* Blurred City Background Image */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <img 
          src={bgImage} 
          alt="City Background" 
          className="w-full h-full object-cover opacity-100 scale-100"
        />
        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen flex-grow">
        <UserNavbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <footer className="bg-white/80 backdrop-blur-md border-t py-6 text-center text-sm text-gray-500 relative z-10">
          &copy; {new Date().getFullYear()} Roommate Finder. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

// Admin Layout wrapper with simple auth check
function AdminLayout() {
  const { currentUser } = useStore();

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex bg-[#fff8f6] min-h-screen font-sans relative overflow-hidden">
      {/* Blurred City Background Image for Admin Console */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=1920" 
          alt="City Background Admin" 
          className="w-full h-full object-cover opacity-[0.06] blur-[20px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#aa3000]/5 via-transparent to-blue-100/10" />
      </div>

      <div className="relative z-10 flex w-full">
        <AdminSidebar />
        <main className="flex-grow overflow-y-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { currentUser } = useStore();

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Auth />} />

        {/* User layout routes */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<UserHome />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/roommates/:id" element={<RoommateProfile />} />
          <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/requests" element={currentUser ? <RoommateRequests /> : <Navigate to="/login" replace />} />
          <Route path="/saved" element={currentUser ? <SavedRooms /> : <Navigate to="/login" replace />} />
          <Route path="/chat" element={currentUser ? <Chat /> : <Navigate to="/login" replace />} />
        </Route>

        {/* Admin layout routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}