import { prisma } from '@repo/db';

import { ReviewCreateSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { requireAdminSession } from '../../lib/auth';

export const GET = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      gallery: { select: { id: true, title: true, slug: true } },
      imageAsset: { select: { id: true, src: true, alt: true } }
    }
  });

  return jsonOk(reviews);
};

export const POST = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, ReviewCreateSchema);
  if (!result.ok) return jsonError(result.error);

  const review = await prisma.review.create({
    data: {
      clientName: result.data.clientName,
      quote: result.data.quote,
      sessionType: result.data.sessionType,
      sessionDate: result.data.sessionDate ? new Date(result.data.sessionDate) : undefined,
      galleryId: result.data.galleryId || undefined,
      imageAssetId: result.data.imageAssetId || undefined,
      isPublished: result.data.isPublished ?? false,
      featuredOnHome: result.data.featuredOnHome ?? false
    },
    include: {
      gallery: { select: { id: true, title: true, slug: true } },
      imageAsset: { select: { id: true, src: true, alt: true } }
    }
  });

  return jsonOk(review, { status: 201 });
};
