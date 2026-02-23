import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { AdminPackageCreateSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { requireAdminSession } from '../../lib/auth';

export const GET = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const packages = await prisma.package.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      modifiers: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return jsonOk(packages);
};

export const POST = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) {
    return authError;
  }

  const result = await parseJson(req, AdminPackageCreateSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  try {
    const createdPackage = await prisma.package.create({
      data: result.data,
      include: {
        modifiers: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return jsonOk(createdPackage, { status: 201 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonError(createApiError('CONFLICT', 'Package slug already exists.'));
    }

    return jsonError(createApiError('INTERNAL', 'Unable to create package.'));
  }
};
