import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  galleryFindFirst: vi.fn()
}));

vi.mock('@repo/db', () => ({
  prisma: {
    gallery: {
      findFirst: mocks.galleryFindFirst
    }
  }
}));

const makeGallery = (overrides = {}) => ({
  id: 'gal_1',
  slug: 'fall-highlights',
  title: 'Fall Highlights',
  description: null,
  location: 'Austin, TX',
  images: [
    {
      id: 'img_1',
      order: 1,
      imageAsset: {
        src: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        alt: 'A sample photo',
        caption: null,
        width: 1200,
        height: 800
      }
    }
  ],
  ...overrides
});

describe('GET /api/public/galleries/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns gallery detail with image dimensions', async () => {
    mocks.galleryFindFirst.mockResolvedValueOnce(makeGallery());

    const { GET } = await import('./[slug]/route');

    const response = await GET(
      new Request('http://localhost/api/public/galleries/fall-highlights'),
      {
        params: { slug: 'fall-highlights' }
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.images[0]).toMatchObject({
      id: 'img_1',
      src: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      alt: 'A sample photo',
      width: 1200,
      height: 800
    });
  });

  it('returns 404 for unknown or unpublished slugs', async () => {
    mocks.galleryFindFirst.mockResolvedValueOnce(null);

    const { GET } = await import('./[slug]/route');

    const response = await GET(
      new Request('http://localhost/api/public/galleries/does-not-exist'),
      { params: { slug: 'does-not-exist' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.message).toBe('Gallery not found.');
  });

  it('passes only PUBLISHED galleries to the query', async () => {
    mocks.galleryFindFirst.mockResolvedValueOnce(makeGallery());

    const { GET } = await import('./[slug]/route');

    await GET(new Request('http://localhost/api/public/galleries/fall-highlights'), {
      params: { slug: 'fall-highlights' }
    });

    expect(mocks.galleryFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PUBLISHED' })
      })
    );
  });
});
