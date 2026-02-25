import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import {
  AdminPackageModifierCreateSchema,
  createApiError,
  jsonError,
  jsonOk,
  parseJson
} from '@repo/core';
import { requireAdminSession } from '../../../../lib/auth';

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const modifiers = await prisma.packageModifier.findMany({
    where: { packageId: params.id },
    orderBy: { createdAt: 'asc' }
  });

  return jsonOk(modifiers);
};

export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const result = await parseJson(req, AdminPackageModifierCreateSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  if (result.data.packageId !== params.id) {
    return jsonError(
      createApiError('VALIDATION_ERROR', 'Request packageId must match route package id.')
    );
  }

  try {
    const modifier = await prisma.packageModifier.create({
      data: result.data
    });

    return jsonOk(modifier, { status: 201 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return jsonError(
          createApiError('CONFLICT', 'Modifier name already exists for this package.')
        );
      }
      if (error.code === 'P2003') {
        return jsonError(createApiError('NOT_FOUND', 'Package not found.'));
      }
    }

    return jsonError(createApiError('INTERNAL', 'Unable to create package modifier.'));
  }
};
