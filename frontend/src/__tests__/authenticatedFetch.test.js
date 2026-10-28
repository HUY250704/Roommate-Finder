import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticatedFetch } from '../utils/authenticatedFetch';

const response = (status, body = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  json: vi.fn().mockResolvedValue(body),
});

describe('authenticatedFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('adds the current access token to normal requests', async () => {
    localStorage.setItem('token', 'access-old');
    fetch.mockResolvedValue(response(200));

    await authenticatedFetch('/api/private');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/private', expect.objectContaining({
      credentials: 'include',
      headers: { Authorization: 'Bearer access-old' },
    }));
  });

  it('refreshes once after 401 and retries with the new token', async () => {
    localStorage.setItem('token', 'access-old');
    fetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200, { token: 'access-new' }))
      .mockResolvedValueOnce(response(200));

    const result = await authenticatedFetch('/api/private');

    expect(result.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/auth\/refresh$/), {
      method: 'POST',
      credentials: 'include',
    });
    expect(fetch).toHaveBeenNthCalledWith(3, '/api/private', expect.objectContaining({
      headers: { Authorization: 'Bearer access-new' },
    }));
    expect(localStorage.getItem('token')).toBe('access-new');
  });

  it('clears the token and does not retry when refresh returns 401', async () => {
    localStorage.setItem('token', 'access-expired');
    fetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(401));

    const result = await authenticatedFetch('/api/private');

    expect(result.status).toBe(401);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('shares one refresh request across concurrent unauthorized requests', async () => {
    localStorage.setItem('token', 'access-old');
    let resolveRefresh;
    const refreshResponse = new Promise((resolve) => {
      resolveRefresh = resolve;
    });
    fetch.mockImplementation((url) => {
      if (String(url).endsWith('/auth/refresh')) return refreshResponse;
      if (fetch.mock.calls.filter(([calledUrl]) => calledUrl === url).length === 1) {
        return Promise.resolve(response(401));
      }
      return Promise.resolve(response(200));
    });

    const firstRequest = authenticatedFetch('/api/first');
    const secondRequest = authenticatedFetch('/api/second');

    await vi.waitFor(() => {
      expect(fetch.mock.calls.filter(([url]) => String(url).endsWith('/auth/refresh'))).toHaveLength(1);
    });
    resolveRefresh(response(200, { token: 'access-new' }));

    const results = await Promise.all([firstRequest, secondRequest]);

    expect(results.map(({ status }) => status)).toEqual([200, 200]);
    expect(fetch.mock.calls.filter(([url]) => String(url).endsWith('/auth/refresh'))).toHaveLength(1);
  });
});
