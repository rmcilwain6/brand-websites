import { prisma } from '@repo/db';

import {
  PrivateGalleryVerifySchema,
  createApiError,
  jsonError,
  jsonOk,
  parseJson
} from '@repo/core';
import { createGalleryAccessToken } from '../../../../../lib/auth';
import { verifyPassword } from '../../../../../lib/password';

const LOCKOUT_WINDOW_MS = 1000 * 60 * 15;
const LOCKOUT_MAX_FAILURES = 10;

const getClientIp = (req: Request): string | null => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (!forwardedFor) {
    return null;
  }
  return forwardedFor.split(',')[0]?.trim() ?? null;
};

export const POST = async (
  req: Request,
  { params }: { params: { token: string } }
): Promise<Response> => {
  const result = await parseJson(req, PrivateGalleryVerifySchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  const gallery = await prisma.gallery.findFirst({
    where: { accessToken: params.token, status: 'PRIVATE' }
  });

  if (!gallery || !gallery.passwordHash) {
    return jsonError(createApiError('NOT_FOUND', 'Gallery not found.'));
  }

  const ipAddress = getClientIp(req);
  const userAgent = req.headers.get('user-agent');

  const recentFailures = await prisma.galleryAccessLog.count({
    where: {
      galleryId: gallery.id,
      success: false,
      createdAt: { gte: new Date(Date.now() - LOCKOUT_WINDOW_MS) }
    }
  });

  if (recentFailures >= LOCKOUT_MAX_FAILURES) {
    return jsonError(
      createApiError('TOO_MANY_REQUESTS', 'Too many failed attempts. Please try again later.')
    );
  }

  const success = verifyPassword(result.data.password, gallery.passwordHash);

  await prisma.galleryAccessLog.create({
    data: { galleryId: gallery.id, success, ipAddress, userAgent }
  });

  if (!success) {
    return jsonError(createApiError('UNAUTHORIZED', 'Incorrect password.'));
  }

  const token = createGalleryAccessToken(gallery.id, gallery.accessToken as string);

  return jsonOk({ token });
};
