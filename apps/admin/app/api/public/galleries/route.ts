import { createApiError, jsonError, jsonOk } from '@repo/core';
import { prisma } from '../../../lib/db';

export const GET = async (): Promise<Response> => {
  try {
    const galleries = await prisma.gallery.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      include: {
        images: {
          where: { isCover: true },
          include: { imageAsset: true },
          take: 1
        }
      }
    });

    return jsonOk(galleries);
  } catch {
    return jsonError(createApiError('INTERNAL', 'Unable to load galleries.'));
  }
};
