import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const store = vi.hoisted(() => ({ currentUser: null, language: 'en' }));

vi.mock('../store', () => ({ useStore: () => store }));
vi.mock('../components/layout/UserNavbar', () => ({ default: () => null }));
vi.mock('../components/layout/AdminSidebar', () => ({ default: () => null }));
vi.mock('../components/layout/MobileBottomNav', () => ({ default: () => null }));
vi.mock('../components/common/PwaInstallPrompt', () => ({ default: () => null }));
vi.mock('../components/common/LanguageSwitcher', () => ({ default: () => null }));
vi.mock('../pages/user/UserHome', () => ({ default: () => <div>User home</div> }));
vi.mock('../pages/user/RoomDetails', () => ({ default: () => <div>Room details</div> }));
vi.mock('../pages/user/RoommateProfile', () => ({ default: () => <div>Roommate profile</div> }));
vi.mock('../pages/user/Profile', () => ({ default: () => <div>Profile page</div> }));
vi.mock('../pages/user/RoommateRequests', () => ({ default: () => <div>Requests page</div> }));
vi.mock('../pages/user/SavedRooms', () => ({ default: () => <div>Saved page</div> }));
vi.mock('../pages/user/Chat', () => ({ default: () => <div>Chat page</div> }));
vi.mock('../pages/user/Auth', () => ({ default: () => <div>Login page</div> }));
vi.mock('../pages/admin/AdminDashboard', () => ({ default: () => <div>Admin dashboard</div> }));
vi.mock('../pages/admin/AdminUsers', () => ({ default: () => <div>Admin users</div> }));
vi.mock('../pages/admin/AdminRooms', () => ({ default: () => <div>Admin rooms</div> }));
vi.mock('../pages/admin/AdminReports', () => ({ default: () => <div>Admin reports</div> }));
vi.mock('../pages/admin/AdminAnalytics', () => ({ default: () => <div>Admin analytics</div> }));

describe('App route guards', () => {
  beforeEach(() => {
    store.currentUser = null;
  });

  it.each(['/profile', '/requests', '/saved', '/chat'])(
    'redirects unauthenticated visitors from %s to login',
    async (path) => {
      window.history.replaceState({}, '', path);

      render(<App />);

      expect(await screen.findByText('Login page')).toBeInTheDocument();
      await waitFor(() => expect(window.location.pathname).toBe('/login'));
    }
  );

  it('redirects a regular user away from admin routes', async () => {
    store.currentUser = { role: 'user' };
    window.history.replaceState({}, '', '/admin');

    render(<App />);

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    await waitFor(() => expect(window.location.pathname).toBe('/login'));
  });

  it('allows an admin to enter the admin dashboard', async () => {
    store.currentUser = { role: 'admin' };
    window.history.replaceState({}, '', '/admin');

    render(<App />);

    expect(await screen.findByText('Admin dashboard')).toBeInTheDocument();
  });
});
