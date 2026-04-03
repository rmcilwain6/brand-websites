import { PrismaClientKnownRequestError, prisma } from '@repo/db';
import { createApiError, jsonError, jsonOk } from '@repo/core';
import { requireAdminSession } from '../../lib/auth';
import { z } from 'zod';

const CreateLocationSchema = z.object({
  name: z.string().trim().min(1)
});

export const GET = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
  return jsonOk(locations);
};

export const POST = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const parsed = CreateLocationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(createApiError('VALIDATION_ERROR', 'name is required.'));
  }

  try {
    const location = await prisma.location.create({ data: { name: parsed.data.name } });
    return jsonOk(location);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      return jsonError(createApiError('CONFLICT', 'A location with that name already exists.'));
    }
    return jsonError(createApiError('INTERNAL', 'Unable to create location.'));
  }
};
