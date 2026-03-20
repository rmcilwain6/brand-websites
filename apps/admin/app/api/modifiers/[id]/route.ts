import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import {
  AdminModifierUpdateSchema,
  createApiError,
  jsonError,
  jsonOk,
  parseJson
} from '@repo/core';
import { requireAdminSession } from '../../../lib/auth';

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const modifier = await prisma.modifier.findUnique({ where: { id: params.id } });
  if (!modifier) return jsonError(createApiError('NOT_FOUND', 'Modifier not found.'));

  return jsonOk(modifier);
};

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, AdminModifierUpdateSchema);
  if (!result.ok) return jsonError(result.error);

  const existing = await prisma.modifier.findUnique({ where: { id: params.id } });
  if (!existing) return jsonError(createApiError('NOT_FOUND', 'Modifier not found.'));

  try {
    const modifier = await prisma.modifier.update({
      where: { id: params.id },
      data: result.data
    });
    return jsonOk(modifier);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonError(createApiError('CONFLICT', 'A modifier with that name already exists.'));
    }
    return jsonError(createApiError('INTERNAL', 'Unable to update modifier.'));
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const existing = await prisma.modifier.findUnique({ where: { id: params.id } });
  if (!existing) return jsonError(createApiError('NOT_FOUND', 'Modifier not found.'));

  try {
    const deleted = await prisma.modifier.delete({ where: { id: params.id } });
    return jsonOk(deleted);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return jsonError(createApiError('NOT_FOUND', 'Modifier not found.'));
    }
    return jsonError(createApiError('INTERNAL', 'Unable to delete modifier.'));
  }
};
