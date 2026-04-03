import { prisma } from '@repo/db';
import { createApiError, jsonError, jsonOk } from '@repo/core';
import { requireAdminSession } from '../../../lib/auth';

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  try {
    await prisma.location.delete({ where: { id: params.id } });
    return jsonOk({ id: params.id });
  } catch {
    return jsonError(createApiError('NOT_FOUND', 'Location not found.'));
  }
};
