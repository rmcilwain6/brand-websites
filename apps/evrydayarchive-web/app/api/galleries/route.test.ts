import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('GET /api/galleries', () => {
  beforeEach(async () => {
    process.env.ADMIN_API_BASE_URL = 'https://api.example.test';
    globalThis.fetch = vi.fn(async () => {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a success response', async () => {
    const { GET } = await import('./route');

    const response = await GET();
    const payload = await response.json();

    expect(Array.isArray(payload)).toBe(true);
  });
});
