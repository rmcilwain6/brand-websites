import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  galleryFindFirst: vi.fn(),
  verifyGalleryAccessToken: vi.fn()
}));

vi.mock('@repo/db', () => ({
  prisma: {
    gallery: { findFirst: mocks.galleryFindFirst }
  }
}));

vi.mock('../../../../lib/auth', () => ({
  verifyGalleryAccessToken: mocks.verifyGalleryAccessToken
}));

const makeRequest = (authorization?: string) =>
  new Request('http://localhost/api/public/private-galleries/tok_1', {
    headers: authorization ? { authorization } : {}
  });

describe('GET /api/public/private-galleries/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('rejects requests with no bearer token', async () => {
    mocks.verifyGalleryAccessToken.mockReturnValueOnce(null);

    const { GET } = await import('./route');
    const response = await GET(makeRequest(), { params: { token: 'tok_1' } });

    expect(response.status).toBe(401);
    expect(mocks.galleryFindFirst).not.toHaveBeenCalled();
  });

  it('rejects requests with an invalid or expired token', async () => {
    mocks.verifyGalleryAccessToken.mockReturnValueOnce(null);

    const { GET } = await import('./route');
    const response = await GET(makeRequest('Bearer bad.token'), { params: { token: 'tok_1' } });

    expect(response.status).toBe(401);
    expect(mocks.galleryFindFirst).not.toHaveBeenCalled();
  });

  it('returns the gallery detail for a valid token', async () => {
    mocks.verifyGalleryAccessToken.mockReturnValueOnce('gal_1');
    mocks.galleryFindFirst.mockResolvedValueOnce({
      id: 'gal_1',
      accessToken: 'tok_1',
      title: 'Acme Co Preview',
      description: null,
      location: null,
      images: [
        {
          id: 'img_1',
          order: 0,
          imageAsset: {
            src: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            alt: 'A sample photo',
            caption: null,
            width: 1200,
            height: 800
          }
        }
      ]
    });

    const { GET } = await import('./route');
    const response = await GET(makeRequest('Bearer good.token'), { params: { token: 'tok_1' } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.title).toBe('Acme Co Preview');
    expect(payload.images[0]).toMatchObject({ id: 'img_1', src: expect.any(String) });
    expect(mocks.galleryFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'gal_1', accessToken: 'tok_1', status: 'PRIVATE' }
      })
    );
  });

  it('returns 404 when the token verifies but the gallery no longer matches', async () => {
    mocks.verifyGalleryAccessToken.mockReturnValueOnce('gal_1');
    mocks.galleryFindFirst.mockResolvedValueOnce(null);

    const { GET } = await import('./route');
    const response = await GET(makeRequest('Bearer good.token'), { params: { token: 'tok_1' } });

    expect(response.status).toBe(404);
  });
});
