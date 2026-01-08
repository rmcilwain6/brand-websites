import { ApiClientError, apiFetch, createApiError, jsonError, jsonOk } from '@repo/core';
import { getPublicEnv } from '../../lib/env';

type GallerySummary = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  images: Array<{
    imageAsset: {
      src: string;
      alt: string;
    };
  }>;
};

export const GET = async (): Promise<Response> => {
  try {
    const { NEXT_PUBLIC_API_BASE_URL } = getPublicEnv();
    const galleries = await apiFetch<GallerySummary[]>(
      `${NEXT_PUBLIC_API_BASE_URL}/api/public/galleries`
    );

    return jsonOk(galleries);
  } catch (error) {
    if (error instanceof ApiClientError) {
      return jsonError(createApiError(error.code, error.message, error.details));
    }

    return jsonError(createApiError('INTERNAL', 'Unable to load galleries.'));
  }
};
