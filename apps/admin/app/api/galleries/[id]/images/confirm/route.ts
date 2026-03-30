import { ConfirmUploadSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { prisma } from '@repo/db';

import { requireAdminSession } from '../../../../../lib/auth';

export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const gallery = await prisma.gallery.findUnique({
    where: { id: params.id },
    select: { id: true }
  });

  if (!gallery) {
    return jsonError(createApiError('NOT_FOUND', 'Gallery not found.'));
  }

  const result = await parseJson(req, ConfirmUploadSchema);
  if (!result.ok) {
    return jsonError(result.error);
  }

  const { secureUrl, width, height, alt } = result.data;

  const [currentCount, existingCover, imageAsset] = await Promise.all([
    prisma.galleryImage.count({ where: { galleryId: params.id } }),
    prisma.galleryImage.findFirst({ where: { galleryId: params.id, isCover: true } }),
    prisma.imageAsset.create({ data: { src: secureUrl, alt, width, height } })
  ]);

  const galleryImage = await prisma.galleryImage.create({
    data: {
      galleryId: params.id,
      imageAssetId: imageAsset.id,
      order: currentCount + 1,
      isCover: !existingCover
    },
    include: { imageAsset: true }
  });

  return jsonOk(galleryImage, { status: 201 });
};
