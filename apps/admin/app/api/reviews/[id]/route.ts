import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { ReviewUpdateSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { requireAdminSession } from '../../../lib/auth';

const reviewInclude = {
  gallery: { select: { id: true, title: true, slug: true } },
  imageAsset: { select: { id: true, src: true, alt: true } }
} as const;

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: reviewInclude
  });

  if (!review) return jsonError(createApiError('NOT_FOUND', 'Review not found.'));

  return jsonOk(review);
};

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, ReviewUpdateSchema);
  if (!result.ok) return jsonError(result.error);

  try {
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        ...result.data,
        sessionDate: result.data.sessionDate ? new Date(result.data.sessionDate) : undefined,
        galleryId: result.data.galleryId === '' ? null : result.data.galleryId,
        imageAssetId: result.data.imageAssetId === '' ? null : result.data.imageAssetId
      },
      include: reviewInclude
    });

    return jsonOk(review);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return jsonError(createApiError('NOT_FOUND', 'Review not found.'));
    }
    return jsonError(createApiError('INTERNAL', 'Unable to update review.'));
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  try {
    await prisma.review.delete({ where: { id: params.id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return jsonError(createApiError('NOT_FOUND', 'Review not found.'));
    }
    return jsonError(createApiError('INTERNAL', 'Unable to delete review.'));
  }
};
