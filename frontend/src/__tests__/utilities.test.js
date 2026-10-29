import { describe, expect, it, vi } from 'vitest';
import { translations } from '../utils/translations';

vi.mock('../utils/authenticatedFetch', () => ({
  authenticatedFetch: vi.fn(),
}));

describe('frontend utility contracts', () => {
  it('provides non-empty translations in Vietnamese and English', () => {
    expect(Object.values(translations.vi).every((value) => typeof value === 'string')).toBe(true);
    expect(Object.values(translations.en).every((value) => typeof value === 'string')).toBe(true);
  });

  it('provides the same translation keys in both languages', () => {
    expect(Object.keys(translations.vi).sort()).toEqual(Object.keys(translations.en).sort());
  });

  it('builds the production API base URL', async () => {
    vi.stubEnv('PROD', true);
    vi.resetModules();
    const { API_BASE_URL } = await import('../config/api');

    expect(API_BASE_URL).toBe('https://roommate-finder-layf.onrender.com/api');
  });

  it('normalizes a development API URL to exactly one /api suffix', async () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_API_URL', 'https://api.example.test/root/api/');
    vi.resetModules();
    const { API_BASE_URL } = await import('../config/api');

    expect(API_BASE_URL).toBe('https://api.example.test/root/api');
  });

  it('sends image uploads to the configured API base URL', async () => {
    const { authenticatedFetch } = await import('../utils/authenticatedFetch');
    authenticatedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://images.example.test/room.jpg', publicId: 'room-1' }),
    });
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_API_URL', 'https://api.example.test/v1');
    vi.resetModules();
    const { uploadImageToCloudinary } = await import('../utils/cloudinary');

    const result = await uploadImageToCloudinary('data:image/png;base64,abc');

    expect(authenticatedFetch).toHaveBeenCalledWith(
      'https://api.example.test/v1/api/upload',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/png;base64,abc' }),
      })
    );
    expect(result.url).toBe('https://images.example.test/room.jpg');
  });
});
