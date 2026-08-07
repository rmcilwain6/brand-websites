import { prisma } from '@repo/db';

import { jsonOk } from '@repo/core';
import { requireAdminSession } from '../../../../lib/auth';

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const logs = await prisma.galleryAccessLog.findMany({
    where: { galleryId: params.id },
    orderBy: { createdAt: 'desc' },
    take: 25
  });

  return jsonOk(
    logs.map((log) => ({
      id: log.id,
      success: log.success,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString()
    }))
  );
};
