import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { AdminPackageUpdateSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { requireAdminSession } from '../../../lib/auth';

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const foundPackage = await prisma.package.findUnique({
    where: { id: params.id },
    include: {
      modifiers: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!foundPackage) {
    return jsonError(createApiError('NOT_FOUND', 'Package not found.'));
  }

  return jsonOk(foundPackage);
};

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const result = await parseJson(req, AdminPackageUpdateSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  try {
    const updatedPackage = await prisma.package.update({
      where: { id: params.id },
      data: result.data,
      include: {
        modifiers: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    return jsonOk(updatedPackage);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return jsonError(createApiError('NOT_FOUND', 'Package not found.'));
      }
      if (error.code === 'P2002') {
        return jsonError(createApiError('CONFLICT', 'Package slug already exists.'));
      }
    }

    return jsonError(createApiError('INTERNAL', 'Unable to update package.'));
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  try {
    const deletedPackage = await prisma.package.delete({
      where: { id: params.id }
    });

    return jsonOk(deletedPackage);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return jsonError(createApiError('NOT_FOUND', 'Package not found.'));
    }

    return jsonError(createApiError('INTERNAL', 'Unable to delete package.'));
  }
};
