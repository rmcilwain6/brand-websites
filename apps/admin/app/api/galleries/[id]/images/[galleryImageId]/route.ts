import { PrismaClientKnownRequestError, prisma } from '@repo/db';
import { createApiError, jsonError, jsonOk } from '@repo/core';
import { requireAdminSession } from '../../../../../lib/auth';

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
