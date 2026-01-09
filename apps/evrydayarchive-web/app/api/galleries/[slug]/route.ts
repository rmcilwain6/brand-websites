import { ApiClientError, apiFetch, createApiError, jsonError, jsonOk } from '@repo/core';
import { getPublicEnv } from '../../../lib/env';

type GalleryDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  images: Array<{
    id: string;
    imageAsset: {
      src: string;
      alt: string;
      caption: string | null;
    };
  }>;
};

export const GET = async (
  _req: Request,
  { params }: { params: { slug: string } }
): Promise<Response> => {
  try {
    const { NEXT_PUBLIC_API_BASE_URL } = getPublicEnv();
    const gallery = await apiFetch<GalleryDetail>(
      `${NEXT_PUBLIC_API_BASE_URL}/api/public/galleries/${params.slug}`
    );

    if (!gallery) {
      return jsonError(createApiError('NOT_FOUND', 'Gallery not found.'));
    }

    return jsonOk(gallery);
  } catch (error) {
    if (error instanceof ApiClientError) {
      return jsonError(createApiError(error.code, error.message, error.details));
    }

    return jsonError(createApiError('INTERNAL', 'Unable to load gallery.'));
  }
};
