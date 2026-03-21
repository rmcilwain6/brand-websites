import { createApiError, jsonError, jsonOk } from '@repo/core';
import { prisma } from '@repo/db';

import { requireAdminSession } from '../../../../../lib/auth';
import { uploadToCloudinary } from '../../../../../lib/cloudinary';

export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const gallery = await prisma.gallery.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true }
  });

  if (!gallery) {
    return jsonError(createApiError('NOT_FOUND', 'Gallery not found.'));
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError(createApiError('VALIDATION_ERROR', 'Invalid form data.'));
  }

  const file = formData.get('file');
  const altRaw = formData.get('alt');

  if (!(file instanceof File)) {
    return jsonError(createApiError('VALIDATION_ERROR', 'File is required.'));
  }

  const alt =
    typeof altRaw === 'string' && altRaw.trim()
      ? altRaw.trim()
      : file.name.replace(/\.[^/.]+$/, '');

  let uploadResult;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    uploadResult = await uploadToCloudinary(buffer, `galleries/${gallery.slug}`);
  } catch {
    return jsonError(createApiError('INTERNAL', 'Failed to upload image to Cloudinary.'));
  }

  const [currentCount, existingCover, imageAsset] = await Promise.all([
    prisma.galleryImage.count({ where: { galleryId: params.id } }),
    prisma.galleryImage.findFirst({ where: { galleryId: params.id, isCover: true } }),
    prisma.imageAsset.create({
      data: {
        src: uploadResult.secure_url,
        alt,
        width: uploadResult.width,
        height: uploadResult.height
      }
    })
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
