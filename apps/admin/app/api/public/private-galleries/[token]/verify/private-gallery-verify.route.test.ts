import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  galleryFindFirst: vi.fn(),
  accessLogCount: vi.fn(),
  accessLogCreate: vi.fn(),
  verifyPassword: vi.fn(),
  createGalleryAccessToken: vi.fn()
}));

vi.mock('@repo/db', () => ({
  prisma: {
    gallery: { findFirst: mocks.galleryFindFirst },
    galleryAccessLog: { count: mocks.accessLogCount, create: mocks.accessLogCreate }
  }
}));

vi.mock('../../../../../lib/password', () => ({
  verifyPassword: mocks.verifyPassword
}));

vi.mock('../../../../../lib/auth', () => ({
  createGalleryAccessToken: mocks.createGalleryAccessToken
}));

const makeRequest = (password: unknown) =>
  new Request('http://localhost/api/public/private-galleries/tok_1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.5' },
    body: JSON.stringify({ password })
  });

describe('POST /api/public/private-galleries/[token]/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.accessLogCount.mockResolvedValue(0);
  });

  it('returns 404 when no private gallery matches the token', async () => {
    mocks.galleryFindFirst.mockResolvedValueOnce(null);

    const { POST } = await import('./route');
    const response = await POST(makeRequest('secret'), { params: { token: 'tok_1' } });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.ok).toBe(false);
  });

  it('logs a failed attempt and rejects an incorrect password', async () => {
    mocks.galleryFindFirst.mockResolvedValueOnce({
      id: 'gal_1',
      accessToken: 'tok_1',
      passwordHash: 'salt:hash'
    });
    mocks.verifyPassword.mockReturnValueOnce(false);

    const { POST } = await import('./route');
    const response = await POST(makeRequest('wrong'), { params: { token: 'tok_1' } });
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.ok).toBe(false);
    expect(mocks.accessLogCreate).toHaveBeenCalledWith({
      data: { galleryId: 'gal_1', success: false, ipAddress: '203.0.113.5', userAgent: null }
    });
    expect(mocks.createGalleryAccessToken).not.toHaveBeenCalled();
  });

  it('logs a success and returns a signed access token for the correct password', async () => {
    mocks.galleryFindFirst.mockResolvedValueOnce({
      id: 'gal_1',
      accessToken: 'tok_1',
      passwordHash: 'salt:hash'
    });
    mocks.verifyPassword.mockReturnValueOnce(true);
    mocks.createGalleryAccessToken.mockReturnValueOnce('signed.token');

    const { POST } = await import('./route');
    const response = await POST(makeRequest('correct'), { params: { token: 'tok_1' } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, data: { token: 'signed.token' } });
    expect(mocks.accessLogCreate).toHaveBeenCalledWith({
      data: { galleryId: 'gal_1', success: true, ipAddress: '203.0.113.5', userAgent: null }
    });
    expect(mocks.createGalleryAccessToken).toHaveBeenCalledWith('gal_1', 'tok_1');
  });

  it('rejects with 429 once the recent-failure lockout threshold is reached', async () => {
    mocks.galleryFindFirst.mockResolvedValueOnce({
      id: 'gal_1',
      accessToken: 'tok_1',
      passwordHash: 'salt:hash'
    });
    mocks.accessLogCount.mockResolvedValueOnce(10);

    const { POST } = await import('./route');
    const response = await POST(makeRequest('correct'), { params: { token: 'tok_1' } });
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.ok).toBe(false);
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
    expect(mocks.accessLogCreate).not.toHaveBeenCalled();
  });
});
