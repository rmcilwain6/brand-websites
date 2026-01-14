import { PublicApiError, fetchPublicGalleryDetail } from '@repo/core';
import { getServerEnv } from '../../../lib/env';

export const GET = async (
  _req: Request,
  { params }: { params: { slug: string } }
): Promise<Response> => {
  try {
    const { ADMIN_API_BASE_URL } = getServerEnv();
    const gallery = await fetchPublicGalleryDetail(ADMIN_API_BASE_URL, params.slug);

    return Response.json(gallery);
  } catch (error) {
    if (error instanceof PublicApiError) {
      return Response.json(
        { message: error.message, details: error.details },
        { status: error.status }
      );
    }

    return Response.json({ message: 'Unable to load gallery.' }, { status: 500 });
  }
};
