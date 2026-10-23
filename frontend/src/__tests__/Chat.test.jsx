import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Chat from '../pages/user/Chat';
import { authenticatedFetch, refreshAccessToken } from '../utils/authenticatedFetch';

const store = vi.hoisted(() => ({ language: 'en' }));
const socket = vi.hoisted(() => ({
  handlers: {},
  on: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('../store', () => ({ useStore: () => store }));
vi.mock('../utils/authenticatedFetch', () => ({
  authenticatedFetch: vi.fn(),
  refreshAccessToken: vi.fn(),
}));
vi.mock('socket.io-client', () => ({
  io: () => {
    socket.handlers = {};
    socket.on.mockImplementation((event, handler) => {
      socket.handlers[event] = handler;
      return socket;
    });
    return socket;
  },
}));

const createMessage = (id, text, createdAt, sender = 'peer-1') => ({
  _id: id,
  conversation: 'conversation-1',
  sender,
  text,
  createdAt,
});

const latestMessage = createMessage('message-2', 'Latest message', '2026-01-02T10:00:00.000Z');
const olderMessage = createMessage('message-1', 'Older message', '2026-01-01T10:00:00.000Z');

const profileResponse = () => ({
  ok: true,
  json: async () => ({ user: { _id: 'user-1' } }),
});

const contactsResponse = () => ({
  ok: true,
  json: async () => [{
    id: 'peer-1',
    name: 'Roommate',
    email: 'peer@example.com',
    conversationId: 'conversation-1',
  }],
});

const messageResponse = (body) => ({
  ok: true,
  json: async () => body,
});

const renderChat = () => render(<MemoryRouter><Chat /></MemoryRouter>);

describe('Chat message handling', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'access-token');
    authenticatedFetch.mockImplementation((url) => {
      if (String(url).endsWith('/users/me')) return Promise.resolve(profileResponse());
      if (String(url).endsWith('/conversations/contacts')) return Promise.resolve(contactsResponse());
      if (String(url).includes('/conversations/messages/')) {
        return Promise.resolve(messageResponse([latestMessage]));
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    refreshAccessToken.mockResolvedValue('access-token');
  });

  it('loads and renders messages from a plain-array response', async () => {
    renderChat();

    expect(await screen.findByText('Latest message')).toBeInTheDocument();
    expect(authenticatedFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/conversations\/messages\/conversation-1\?page=1&limit=20$/),
      expect.any(Object)
    );
    expect(screen.queryByRole('button', { name: 'Load older messages' })).not.toBeInTheDocument();
  });

  it('loads and renders messages from a paginated object response', async () => {
    authenticatedFetch.mockImplementation((url) => {
      if (String(url).endsWith('/users/me')) return Promise.resolve(profileResponse());
      if (String(url).endsWith('/conversations/contacts')) return Promise.resolve(contactsResponse());
      if (String(url).includes('/conversations/messages/')) {
        return Promise.resolve(messageResponse({
          messages: [latestMessage],
          page: 1,
          limit: 1,
          total: 2,
        }));
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    renderChat();

    expect(await screen.findByText('Latest message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load older messages' })).toBeInTheDocument();
  });

  it('loads the next page and does not duplicate messages already loaded', async () => {
    authenticatedFetch.mockImplementation((url) => {
      if (String(url).endsWith('/users/me')) return Promise.resolve(profileResponse());
      if (String(url).endsWith('/conversations/contacts')) return Promise.resolve(contactsResponse());
      if (String(url).includes('/conversations/messages/')) {
        const isOlderPage = String(url).includes('page=2');
        return Promise.resolve(messageResponse({
          messages: isOlderPage ? [olderMessage, latestMessage] : [latestMessage],
          page: isOlderPage ? 2 : 1,
          limit: 2,
          total: 3,
        }));
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    renderChat();
    await screen.findByText('Latest message');

    fireEvent.click(screen.getByRole('button', { name: 'Load older messages' }));

    expect(await screen.findByText('Older message')).toBeInTheDocument();
    expect(authenticatedFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/conversations\/messages\/conversation-1\?page=2&limit=20$/),
      expect.any(Object)
    );
    expect(screen.getAllByText('Latest message')).toHaveLength(1);
  });

  it('does not add the same message twice when it arrives over the socket', async () => {
    renderChat();
    await screen.findByText('Latest message');
    await waitFor(() => expect(socket.handlers.messageReceived).toBeDefined());

    socket.handlers.messageReceived(latestMessage);

    expect(screen.getAllByText('Latest message')).toHaveLength(1);
  });
});
