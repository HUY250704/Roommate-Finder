import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminRooms from '../pages/admin/AdminRooms';

const mocks = vi.hoisted(() => ({ authenticatedFetch: vi.fn() }));

vi.mock('../store', () => ({ useStore: () => ({ language: 'en' }) }));
vi.mock('../utils/authenticatedFetch', () => ({
  authenticatedFetch: mocks.authenticatedFetch,
}));

const response = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

const rooms = [
  {
    _id: 'room-pending',
    title: 'Room awaiting approval',
    status: 'pending',
    price: 2500000,
    location: 'Da Nang',
    images: [],
    owner: { username: 'Owner One' },
  },
  {
    _id: 'room-reported',
    title: 'Reported room',
    status: 'available',
    price: 3000000,
    location: 'Da Nang',
    images: [],
    owner: { username: 'Owner Two' },
  },
];

describe('AdminRooms', () => {
  beforeEach(() => {
    mocks.authenticatedFetch.mockReset();
    mocks.authenticatedFetch.mockImplementation(url => Promise.resolve(
      url.includes('/admin/reports')
        ? response([{ status: 'pending', reportedRoom: { _id: 'room-reported' } }])
        : response(rooms)
    ));
  });

  it('loads real rooms and filters pending and reported listings', async () => {
    render(<AdminRooms />);

    expect(await screen.findByText('Room awaiting approval')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));

    expect(screen.getByText('Room awaiting approval')).toBeInTheDocument();
    expect(screen.queryByText('Reported room')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reported' }));
    expect(screen.getByText('Reported room')).toBeInTheDocument();
    expect(screen.queryByText('Room awaiting approval')).not.toBeInTheDocument();
  });

  it('persists approval changes through the admin API', async () => {
    mocks.authenticatedFetch.mockImplementation(url => {
      if (url.includes('/admin/reports')) return Promise.resolve(response([]));
      if (url.endsWith('/status')) return Promise.resolve(response({ room: { status: 'approved' } }));
      return Promise.resolve(response(rooms));
    });

    render(<AdminRooms />);
    await screen.findByText('Room awaiting approval');
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(mocks.authenticatedFetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/rooms/room-pending/status'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'approved' }),
        })
      );
    });
    expect(await screen.findByText('approved')).toBeInTheDocument();
  });

  it('shows backend errors instead of silently treating the request as successful', async () => {
    mocks.authenticatedFetch.mockImplementation(url => Promise.resolve(
      url.includes('/admin/reports')
        ? response({ message: 'Reports unavailable' }, 500)
        : response(rooms)
    ));

    render(<AdminRooms />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Reports unavailable');
  });
});
