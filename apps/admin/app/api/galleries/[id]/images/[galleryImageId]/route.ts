import { PrismaClientKnownRequestError, prisma } from '@repo/db';
import { createApiError, jsonError, jsonOk } from '@repo/core';
import { requireAdminSession } from '../../../../../lib/auth';

export const PATCH = async (
  req: Request,
  { params }: { params: { id: string; galleryImageId: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  // Unset current cover, then set the new one — both in a transaction
  await prisma.$transaction([
    prisma.galleryImage.updateMany({
      where: { galleryId: params.id, isCover: true },
      data: { isCover: false }
    }),
    prisma.galleryImage.update({
      where: { id: params.galleryImageId },
      data: { isCover: true }
    })
  ]);

  return jsonOk({ id: params.galleryImageId, isCover: true });
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string; galleryImageId: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  try {
    const deleted = await prisma.galleryImage.delete({
      where: { id: params.galleryImageId }
    });

    return jsonOk(deleted);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return jsonError(createApiError('NOT_FOUND', 'Gallery image not found.'));
    }

    return jsonError(createApiError('INTERNAL', 'Unable to remove image.'));
  }
};
