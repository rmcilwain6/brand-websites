import { describe, expect, it } from 'vitest';

import { GalleryCreateSchema, GalleryPublishSchema, ImageAssetCreateSchema } from './gallery';

describe('Gallery schemas', () => {
  it('accepts a valid gallery create payload', () => {
    const result = GalleryCreateSchema.safeParse({
      title: 'Fall Highlights',
      slug: 'fall-highlights',
      headline: 'Golden hour on the coast',
      description: 'Warm tones and family portraits.',
      location: 'Austin, TX',
      shootDate: '2024-10-15'
    });

    expect(result.success).toBe(true);
  });

  it('accepts a gallery create payload without optional fields', () => {
    const result = GalleryCreateSchema.safeParse({
      title: 'Fall Highlights',
      slug: 'fall-highlights'
    });

    expect(result.success).toBe(true);
  });

  it('coerces a shootDate string to a Date', () => {
    const result = GalleryCreateSchema.safeParse({
      title: 'Fall Highlights',
      slug: 'fall-highlights',
      shootDate: '2024-10-15'
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.shootDate).toBeInstanceOf(Date);
    }
  });

  it('rejects invalid gallery slugs', () => {
    const result = GalleryCreateSchema.safeParse({
      title: 'Invalid slug',
      slug: 'Bad Slug!'
    });

    expect(result.success).toBe(false);
  });

  it('accepts image assets and publish payloads', () => {
    const assetResult = ImageAssetCreateSchema.safeParse({
      src: 'https://example.com/photo.jpg',
      alt: 'A sample image',
      width: 1200,
      height: 800
    });
    const publishResult = GalleryPublishSchema.safeParse({
      status: 'PUBLISHED'
    });

    expect(assetResult.success).toBe(true);
    expect(publishResult.success).toBe(true);
  });
});
