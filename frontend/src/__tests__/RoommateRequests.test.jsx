import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RoommateRequests from '../pages/user/RoommateRequests';

const mocks = vi.hoisted(() => ({
  store: { language: 'en', currentUser: { id: 'user-1' } },
  authenticatedFetch: vi.fn(),
}));

vi.mock('../store', () => ({ useStore: () => mocks.store }));
vi.mock('../utils/authenticatedFetch', () => ({
  authenticatedFetch: mocks.authenticatedFetch,
}));
vi.mock('../components/common/LanguageSwitcher', () => ({ default: () => null }));

const jsonResponse = (body) => ({
  ok: true,
  json: async () => body,
});

describe('RoommateRequests', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    mocks.authenticatedFetch.mockImplementation((url) => Promise.resolve(
      String(url).includes('/people?')
        ? jsonResponse([{ _id: 'user-2', username: 'Alex' }])
        : jsonResponse([
          {
            _id: 'request-in',
            sender: { _id: 'user-2', username: 'Alex' },
            receiver: { _id: 'user-1', username: 'Me' },
            status: 'pending',
          },
          {
            _id: 'request-out',
            sender: { _id: 'user-1', username: 'Me' },
            receiver: { _id: 'user-3', username: 'Sam' },
            status: 'pending',
          },
        ])
    ));
  });

  it('splits the API request array into received and sent lists', async () => {
    render(<RoommateRequests />);

    const receivedSection = screen.getByRole('heading', { name: 'Received requests' }).parentElement;
    const sentSection = screen.getByRole('heading', { name: 'Sent requests' }).parentElement;

    await waitFor(() => {
      expect(within(receivedSection).getByText('Alex')).toBeInTheDocument();
      expect(within(sentSection).getByText('Sam')).toBeInTheDocument();
    });

    expect(screen.queryByText('Invalid roommate requests response')).not.toBeInTheDocument();
  });
});
