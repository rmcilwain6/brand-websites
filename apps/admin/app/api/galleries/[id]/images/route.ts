import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { GalleryImageAttachSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { requireAdminSession } from '../../../../lib/auth';

export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const result = await parseJson(req, GalleryImageAttachSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  try {
    const galleryImage = await prisma.galleryImage.create({
      data: {
        galleryId: params.id,
        imageAssetId: result.data.imageAssetId,
        order: result.data.order,
        isCover: result.data.isCover ?? false
      },
      include: { imageAsset: true }
    });

    return jsonOk(galleryImage, { status: 201 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return jsonError(createApiError('CONFLICT', 'Image already attached.'));
      }
      if (error.code === 'P2003') {
        return jsonError(createApiError('NOT_FOUND', 'Gallery or image not found.'));
      }
    }

    return jsonError(createApiError('INTERNAL', 'Unable to attach image.'));
  }
};
