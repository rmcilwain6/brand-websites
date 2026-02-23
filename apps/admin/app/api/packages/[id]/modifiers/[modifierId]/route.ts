import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { AdminPackageModifierUpdateSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { requireAdminSession } from '../../../../../lib/auth';

export const GET = async (
  req: Request,
  { params }: { params: { id: string; modifierId: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const modifier = await prisma.packageModifier.findFirst({
    where: {
      id: params.modifierId,
      packageId: params.id
    }
  });

  if (!modifier) {
    return jsonError(createApiError('NOT_FOUND', 'Package modifier not found.'));
  }

  return jsonOk(modifier);
};

export const PUT = async (
  req: Request,
  { params }: { params: { id: string; modifierId: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const result = await parseJson(req, AdminPackageModifierUpdateSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  const existingModifier = await prisma.packageModifier.findFirst({
    where: {
      id: params.modifierId,
      packageId: params.id
    }
  });

  if (!existingModifier) {
    return jsonError(createApiError('NOT_FOUND', 'Package modifier not found.'));
  }

  try {
    const modifier = await prisma.packageModifier.update({
      where: { id: params.modifierId },
      data: result.data
    });

    return jsonOk(modifier);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonError(createApiError('CONFLICT', 'Modifier name already exists for this package.'));
    }

    return jsonError(createApiError('INTERNAL', 'Unable to update package modifier.'));
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string; modifierId: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const modifier = await prisma.packageModifier.findFirst({
    where: {
      id: params.modifierId,
      packageId: params.id
    }
  });

  if (!modifier) {
    return jsonError(createApiError('NOT_FOUND', 'Package modifier not found.'));
  }

  try {
    const deleted = await prisma.packageModifier.delete({
      where: { id: params.modifierId }
    });

    return jsonOk(deleted);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return jsonError(createApiError('NOT_FOUND', 'Package modifier not found.'));
    }

    return jsonError(createApiError('INTERNAL', 'Unable to delete package modifier.'));
  }
};
