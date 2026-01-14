import {
  GalleryDetailSchema,
  GalleryListResponseSchema,
  type GalleryDetail,
  type GalleryListItem
} from '../schemas/gallery';

export class PublicApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'PublicApiError';
  }
}

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

export const fetchPublicGalleries = async (
  baseUrl: string,
  init?: PublicFetchOptions
): Promise<GalleryListItem[]> => {
  const url = new URL('/api/public/galleries', baseUrl);
  const response = await fetch(url, { ...init, method: 'GET' });

  if (!response.ok) {
    const details = await parseJson(response).catch(() => undefined);
    throw new PublicApiError('Failed to load galleries.', response.status, details);
  }

  const payload = await parseJson(response);
  const parsed = GalleryListResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new PublicApiError(
      'Gallery list response did not match the expected schema.',
      response.status,
      parsed.error.format()
    );
  }

  return parsed.data;
};

export const fetchPublicGalleryDetail = async (
  baseUrl: string,
  slug: string,
  init?: PublicFetchOptions
): Promise<GalleryDetail> => {
  const url = new URL(`/api/public/galleries/${encodeURIComponent(slug)}`, baseUrl);
  const response = await fetch(url, { ...init, method: 'GET' });

  if (!response.ok) {
    const details = await parseJson(response).catch(() => undefined);
    throw new PublicApiError('Failed to load gallery.', response.status, details);
  }

  const payload = await parseJson(response);
  const parsed = GalleryDetailSchema.safeParse(payload);

  if (!parsed.success) {
    throw new PublicApiError(
      'Gallery detail response did not match the expected schema.',
      response.status,
      parsed.error.format()
    );
  }

  return parsed.data;
};

export type { PublicFetchOptions };
