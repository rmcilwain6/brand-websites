import { randomBytes } from 'node:crypto';

import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { GalleryPublishSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { requireAdminSession } from '../../../../lib/auth';

export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const result = await parseJson(req, GalleryPublishSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  try {
    const publishedAt = result.data.status === 'PUBLISHED' ? new Date() : null;

    let accessToken: string | undefined;
    if (result.data.status === 'PRIVATE') {
      const existing = await prisma.gallery.findUnique({
        where: { id: params.id },
        select: { accessToken: true }
      });
      accessToken = existing?.accessToken ?? randomBytes(9).toString('base64url');
    }

    const gallery = await prisma.gallery.update({
      where: { id: params.id },
      data: {
        status: result.data.status,
        publishedAt,
        ...(accessToken ? { accessToken } : {})
      }
    });

    return jsonOk({
      status: gallery.status,
      publishedAt: gallery.publishedAt,
      accessToken: gallery.accessToken
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return jsonError(createApiError('NOT_FOUND', 'Gallery not found.'));
    }

    return jsonError(createApiError('INTERNAL', 'Unable to update status.'));
  }
};
