import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import {
  AdminPackageModifierUpdateSchema,
  createApiError,
  jsonError,
  jsonOk,
  parseJson
} from '@repo/core';
import { requireAdminSession } from '../../../../../lib/auth';

export const GET = async (
  req: Request,
  { params }: { params: { id: string; modifierId: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const assignment = await prisma.packageModifier.findFirst({
    where: { id: params.modifierId, packageId: params.id },
    include: { modifier: true }
  });

  if (!assignment) return jsonError(createApiError('NOT_FOUND', 'Package modifier not found.'));

  return jsonOk(assignment);
};

export const PUT = async (
  req: Request,
  { params }: { params: { id: string; modifierId: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, AdminPackageModifierUpdateSchema);
  if (!result.ok) return jsonError(result.error);

  const existing = await prisma.packageModifier.findFirst({
    where: { id: params.modifierId, packageId: params.id }
  });

  if (!existing) return jsonError(createApiError('NOT_FOUND', 'Package modifier not found.'));

  const assignment = await prisma.packageModifier.update({
    where: { id: params.modifierId },
    data: result.data,
    include: { modifier: true }
  });

  return jsonOk(assignment);
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string; modifierId: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const existing = await prisma.packageModifier.findFirst({
    where: { id: params.modifierId, packageId: params.id },
    include: { modifier: true }
  });

  if (!existing) return jsonError(createApiError('NOT_FOUND', 'Package modifier not found.'));

  try {
    await prisma.packageModifier.delete({ where: { id: params.modifierId } });
    return jsonOk(existing);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return jsonError(createApiError('NOT_FOUND', 'Package modifier not found.'));
    }
    return jsonError(createApiError('INTERNAL', 'Unable to remove modifier.'));
  }
};
