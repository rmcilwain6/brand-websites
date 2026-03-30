import { createApiError, jsonError, jsonOk } from '@repo/core';
import { prisma } from '@repo/db';

import { requireAdminSession } from '../../../../../lib/auth';
import { generateUploadSignature } from '../../../../../lib/cloudinary';

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const gallery = await prisma.gallery.findUnique({
    where: { id: params.id },
    select: { slug: true }
  });

  if (!gallery) {
    return jsonError(createApiError('NOT_FOUND', 'Gallery not found.'));
  }

  const sigData = generateUploadSignature(`galleries/${gallery.slug}`);

  return jsonOk(sigData);
};
