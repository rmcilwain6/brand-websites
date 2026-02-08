import { describe, expect, it, vi } from 'vitest';

import { PublicApiError, fetchPublicGalleries } from '@repo/core';

vi.mock('@repo/core', async () => {
  const actual = await vi.importActual<typeof import('@repo/core')>('@repo/core');
  return {
    ...actual,
    fetchPublicGalleries: vi.fn()
  };
});

vi.mock('../../lib/env', () => ({
  getServerEnv: () => ({ ADMIN_API_BASE_URL: 'https://api.example.test' })
}));

describe('GET /api/galleries error handling', () => {
  it('returns the upstream error payload for PublicApiError', async () => {
    vi.mocked(fetchPublicGalleries).mockRejectedValueOnce(
      new PublicApiError('Failed to load galleries.', 502, { message: 'Bad gateway' })
    );

    const { GET } = await import('./route');

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload).toEqual({
      message: 'Failed to load galleries.',
      details: { message: 'Bad gateway' }
    });
  });
});
