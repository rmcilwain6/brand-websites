import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { GalleryCreateSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { requireAdminSession } from '../../lib/auth';
import { hashPassword } from '../../lib/password';

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

  const sanitized = galleries.map(({ passwordHash, ...gallery }) => ({
    ...gallery,
    hasPassword: !!passwordHash
  }));

  return jsonOk(sanitized);
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

  const { password, ...rest } = result.data;

  try {
    const gallery = await prisma.gallery.create({
      data: {
        ...rest,
        status: 'DRAFT',
        ...(password ? { passwordHash: hashPassword(password) } : {})
      }
    });

    const { passwordHash: _passwordHash, ...galleryWithoutPasswordHash } = gallery;

    return jsonOk(
      { ...galleryWithoutPasswordHash, hasPassword: !!gallery.passwordHash },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonError(createApiError('CONFLICT', 'Gallery slug already exists.'));
    }

    return jsonError(createApiError('INTERNAL', 'Unable to create gallery.'));
  }
};
