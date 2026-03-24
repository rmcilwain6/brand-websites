import { describe, expect, it } from 'vitest';

import {
  PublicReviewListSchema,
  PublicReviewSchema,
  ReviewCreateSchema,
  ReviewUpdateSchema
} from './review';

describe('ReviewCreateSchema', () => {
  it('accepts a valid payload with all fields', () => {
    const result = ReviewCreateSchema.safeParse({
      clientName: 'Jane Smith',
      quote: 'Absolutely loved the experience.',
      sessionType: 'Family session',
      sessionDate: '2024-09-15T00:00:00.000Z',
      galleryId: 'gal_123',
      imageAssetId: 'img_456',
      isPublished: true,
      featuredOnHome: false
    });

    expect(result.success).toBe(true);
  });

  it('accepts a valid payload with required fields only', () => {
    const result = ReviewCreateSchema.safeParse({
      clientName: 'Jane Smith',
      quote: 'Absolutely loved the experience.'
    });

    expect(result.success).toBe(true);
  });

  it('rejects a missing clientName', () => {
    const result = ReviewCreateSchema.safeParse({
      quote: 'Great session!'
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty clientName', () => {
    const result = ReviewCreateSchema.safeParse({
      clientName: '',
      quote: 'Great session!'
    });

    expect(result.success).toBe(false);
  });

  it('rejects a missing quote', () => {
    const result = ReviewCreateSchema.safeParse({
      clientName: 'Jane Smith'
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty quote', () => {
    const result = ReviewCreateSchema.safeParse({
      clientName: 'Jane Smith',
      quote: ''
    });

    expect(result.success).toBe(false);
  });

  it('rejects a sessionDate that is not a full datetime string', () => {
    const result = ReviewCreateSchema.safeParse({
      clientName: 'Jane Smith',
      quote: 'Great session!',
      sessionDate: '2024-09-15'
    });

    expect(result.success).toBe(false);
  });

  it('rejects a sessionDate that is not a valid date at all', () => {
    const result = ReviewCreateSchema.safeParse({
      clientName: 'Jane Smith',
      quote: 'Great session!',
      sessionDate: 'not-a-date'
    });

    expect(result.success).toBe(false);
  });
});

describe('ReviewUpdateSchema', () => {
  it('accepts a partial update', () => {
    const result = ReviewUpdateSchema.safeParse({
      quote: 'Updated quote.'
    });

    expect(result.success).toBe(true);
  });

  it('accepts an empty object', () => {
    const result = ReviewUpdateSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('still rejects an empty clientName when provided', () => {
    const result = ReviewUpdateSchema.safeParse({
      clientName: ''
    });

    expect(result.success).toBe(false);
  });

  it('still rejects a malformed sessionDate when provided', () => {
    const result = ReviewUpdateSchema.safeParse({
      sessionDate: '2024-09-15'
    });

    expect(result.success).toBe(false);
  });
});

describe('PublicReviewSchema', () => {
  it('parses a full public review', () => {
    const result = PublicReviewSchema.safeParse({
      id: 'rev_1',
      clientName: 'Jane Smith',
      quote: 'Amazing!',
      sessionType: 'Family session',
      sessionDate: '2024-09-15T00:00:00.000Z',
      gallerySlug: 'fall-highlights',
      image: {
        src: 'https://example.com/photo.jpg',
        alt: 'Family portrait',
        width: 1200,
        height: 800
      }
    });

    expect(result.success).toBe(true);
  });

  it('parses a review with all nullable fields set to null', () => {
    const result = PublicReviewSchema.safeParse({
      id: 'rev_2',
      clientName: 'John Doe',
      quote: 'Loved it.',
      sessionType: null,
      sessionDate: null,
      gallerySlug: null,
      image: null
    });

    expect(result.success).toBe(true);
  });

  it('rejects a review with an invalid image URL', () => {
    const result = PublicReviewSchema.safeParse({
      id: 'rev_3',
      clientName: 'John Doe',
      quote: 'Loved it.',
      sessionType: null,
      sessionDate: null,
      gallerySlug: null,
      image: {
        src: 'not-a-url',
        alt: 'Photo',
        width: null,
        height: null
      }
    });

    expect(result.success).toBe(false);
  });
});

describe('PublicReviewListSchema', () => {
  it('parses an empty array', () => {
    const result = PublicReviewListSchema.safeParse([]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });

  it('parses a list of reviews', () => {
    const result = PublicReviewListSchema.safeParse([
      {
        id: 'rev_1',
        clientName: 'Jane',
        quote: 'Great!',
        sessionType: null,
        sessionDate: null,
        gallerySlug: null,
        image: null
      }
    ]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
  });
});
