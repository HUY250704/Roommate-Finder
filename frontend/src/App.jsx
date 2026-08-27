import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useStore } from './store';

// Layouts
import UserNavbar from './components/layout/UserNavbar';
import AdminSidebar from './components/layout/AdminSidebar';

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
import AdminViewings from './pages/admin/AdminViewings';

// User Layout wrapper
function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <UserNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Roommate Finder. All rights reserved.
      </footer>
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
    <div className="flex bg-gray-100 min-h-screen font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
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
          <Route path="viewings" element={<AdminViewings />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}