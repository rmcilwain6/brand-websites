import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { GalleryUpdateSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { requireAdminSession } from '../../../lib/auth';
import { hashPassword } from '../../../lib/password';

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

  const { passwordHash: _passwordHash, ...galleryWithoutPasswordHash } = gallery;

  return jsonOk({ ...galleryWithoutPasswordHash, hasPassword: !!gallery.passwordHash });
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

  const { password, ...rest } = result.data;

  try {
    const gallery = await prisma.gallery.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(password ? { passwordHash: hashPassword(password) } : {})
      }
    });

    const { passwordHash: _passwordHash, ...galleryWithoutPasswordHash } = gallery;

    return jsonOk({ ...galleryWithoutPasswordHash, hasPassword: !!gallery.passwordHash });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
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
