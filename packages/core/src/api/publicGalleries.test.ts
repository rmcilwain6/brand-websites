import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PublicApiError, fetchPublicGalleries, fetchPublicGalleryDetail } from './publicGalleries';

const galleryListResponse = [
  {
    id: 'gallery-1',
    slug: 'fall-highlights',
    title: 'Fall Highlights',
    location: 'Austin, TX',
    coverImage: { src: 'https://example.com/cover.jpg', alt: 'Cover' },
    imageCount: 12
  }
];

const galleryDetailResponse = {
  id: 'gallery-1',
  slug: 'fall-highlights',
  title: 'Fall Highlights',
  description: null,
  location: 'Austin, TX',
  images: [
    {
      id: 'image-1',
      order: 0,
      src: 'https://example.com/photo.jpg',
      alt: 'Photo',
      caption: null,
      width: 1200,
      height: 800
    }
  ]
};

describe('public gallery API helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and parses the gallery list', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(galleryListResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const result = await fetchPublicGalleries('https://api.example.test');

    expect(result).toEqual(galleryListResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/api/public/galleries', 'https://api.example.test'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('fetches and parses a gallery detail', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(galleryDetailResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const result = await fetchPublicGalleryDetail('https://api.example.test', 'fall-highlights');

    expect(result).toEqual(galleryDetailResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/api/public/galleries/fall-highlights', 'https://api.example.test'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('throws a PublicApiError when the response is not ok', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Nope' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    await expect(fetchPublicGalleries('https://api.example.test')).rejects.toEqual(
      expect.objectContaining({
        name: 'PublicApiError',
        message: 'Failed to load galleries.',
        status: 503,
        details: { message: 'Nope' }
      })
    );
  });

  it('throws a PublicApiError when the response schema does not match', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 'missing-fields' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    await expect(fetchPublicGalleries('https://api.example.test')).rejects.toEqual(
      expect.objectContaining({
        name: 'PublicApiError',
        message: 'Gallery list response did not match the expected schema.'
      })
    );
  });

  it('throws a PublicApiError when JSON parsing fails', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce(
      new Response('not-json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    await expect(fetchPublicGalleries('https://api.example.test')).rejects.toEqual(
      expect.objectContaining({
        name: 'PublicApiError',
        message: 'Failed to parse API response JSON.'
      })
    );
  });
});
