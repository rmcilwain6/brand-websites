import { Prisma, prisma } from '@repo/db';

import {
  GalleryUpdateSchema,
  createApiError,
  jsonError,
  jsonOk,
  parseJson
} from '@repo/core';
import { requireAdminSession } from '../../../lib/auth';

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const gallery = await prisma.gallery.findUnique({
    where: { id: params.id },
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
};

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const result = await parseJson(req, GalleryUpdateSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  try {
    const gallery = await prisma.gallery.update({
      where: { id: params.id },
      data: result.data
    });

    return jsonOk(gallery);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return jsonError(createApiError('NOT_FOUND', 'Gallery not found.'));
      }
      if (error.code === 'P2002') {
        return jsonError(createApiError('CONFLICT', 'Gallery slug already exists.'));
      }
    }

    return jsonError(createApiError('INTERNAL', 'Unable to update gallery.'));
  }
};
