import { Prisma, prisma } from '@repo/db';

import { GalleryCreateSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { requireAdminSession } from '../../lib/auth';

export const GET = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      images: {
        where: { isCover: true },
        include: { imageAsset: true },
        take: 1
      }
    }
  });

  return jsonOk(galleries);
};

export const POST = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const result = await parseJson(req, GalleryCreateSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  try {
    const gallery = await prisma.gallery.create({
      data: {
        ...result.data,
        status: 'DRAFT'
      }
    });

    return jsonOk(gallery, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonError(createApiError('CONFLICT', 'Gallery slug already exists.'));
    }

    return jsonError(createApiError('INTERNAL', 'Unable to create gallery.'));
  }
};
