import { PublicApiError, fetchPublicGalleries } from '@repo/core';
import { getServerEnv } from '../../lib/env';

export const GET = async (): Promise<Response> => {
  try {
    const { ADMIN_API_BASE_URL } = getServerEnv();
    const galleries = await fetchPublicGalleries(ADMIN_API_BASE_URL);

    return Response.json(galleries);
  } catch (error) {
    if (error instanceof PublicApiError) {
      return Response.json(
        { message: error.message, details: error.details },
        { status: error.status }
      );
    }

    return Response.json({ message: 'Unable to load galleries.' }, { status: 500 });
  }
};
