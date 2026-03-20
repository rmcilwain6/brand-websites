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
  if (authError) return authError;

  const assignments = await prisma.packageModifier.findMany({
    where: { packageId: params.id },
    include: { modifier: true },
    orderBy: { sortOrder: 'asc' }
  });

  return jsonOk(assignments);
};

export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, AdminPackageModifierCreateSchema);
  if (!result.ok) return jsonError(result.error);

  try {
    const assignment = await prisma.packageModifier.create({
      data: { packageId: params.id, ...result.data },
      include: { modifier: true }
    });
    return jsonOk(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return jsonError(
          createApiError('CONFLICT', 'This modifier is already assigned to the package.')
        );
      }
      if (error.code === 'P2003') {
        return jsonError(createApiError('NOT_FOUND', 'Package or modifier not found.'));
      }
    }
    return jsonError(createApiError('INTERNAL', 'Unable to assign modifier.'));
  }
};
