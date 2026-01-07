import { ImageAssetCreateSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { prisma } from '../../lib/db';
import { requireAdminSession } from '../../lib/auth';

export const POST = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const result = await parseJson(req, ImageAssetCreateSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  try {
    const imageAsset = await prisma.imageAsset.create({
      data: result.data
    });

    return jsonOk(imageAsset, { status: 201 });
  } catch {
    return jsonError(createApiError('INTERNAL', 'Unable to create image asset.'));
  }
};
