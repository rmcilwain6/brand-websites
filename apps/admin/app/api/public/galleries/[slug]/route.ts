import { createApiError, jsonError, jsonOk } from '@repo/core';
import { prisma } from '../../../../lib/db';

export const GET = async (
  _req: Request,
  { params }: { params: { slug: string } }
): Promise<Response> => {
  try {
    const gallery = await prisma.gallery.findFirst({
      where: {
        slug: params.slug,
        status: 'PUBLISHED'
      },
      include: {
        images: {
          include: { imageAsset: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!gallery) {
      return jsonError(createApiError('NOT_FOUND', 'Gallery not found.'));
    }

    return jsonOk(gallery);
  } catch {
    return jsonError(createApiError('INTERNAL', 'Unable to load gallery.'));
  }
};
