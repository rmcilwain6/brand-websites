import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import {
  AdminModifierCreateSchema,
  createApiError,
  jsonError,
  jsonOk,
  parseJson
} from '@repo/core';
import { requireAdminSession } from '../../lib/auth';

export const GET = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const modifiers = await prisma.modifier.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });

  return jsonOk(modifiers);
};

export const POST = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, AdminModifierCreateSchema);
  if (!result.ok) return jsonError(result.error);

  try {
    const modifier = await prisma.modifier.create({ data: result.data });
    return jsonOk(modifier, { status: 201 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonError(createApiError('CONFLICT', 'A modifier with that name already exists.'));
    }
    return jsonError(createApiError('INTERNAL', 'Unable to create modifier.'));
  }
};
