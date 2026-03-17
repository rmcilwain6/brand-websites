import { PublicReviewListSchema, type PublicReview } from '../schemas/review';

import { PublicApiError } from './publicGalleries';

type PublicFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

const parseJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch (error) {
    throw new PublicApiError('Failed to parse API response JSON.', response.status, error);
  }
};

export const fetchPublicReviews = async (
  baseUrl: string,
  init?: PublicFetchOptions
): Promise<PublicReview[]> => {
  const url = new URL('/api/public/reviews', baseUrl);
  const response = await fetch(url, { ...init, method: 'GET' });

  if (!response.ok) {
    const details = await parseJson(response).catch(() => undefined);
    throw new PublicApiError('Failed to load reviews.', response.status, details);
  }

  const payload = await parseJson(response);
  const parsed = PublicReviewListSchema.safeParse(payload);

  if (!parsed.success) {
    throw new PublicApiError(
      'Review list response did not match the expected schema.',
      response.status,
      parsed.error.format()
    );
  }

  return parsed.data;
};
