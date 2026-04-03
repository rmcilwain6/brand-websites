import { prisma } from '@repo/db';
import { createApiError, jsonError, jsonOk } from '@repo/core';
import { requireAdminSession } from '../../../lib/auth';
import { z } from 'zod';

const UpdateWindowSchema = z.object({
  locationId: z.string().min(1).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  notes: z.string().nullable().optional()
});

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const parsed = UpdateWindowSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(createApiError('VALIDATION_ERROR', 'Invalid update payload.'));
  }

  const { locationId, startDate, endDate, notes } = parsed.data;

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return jsonError(createApiError('VALIDATION_ERROR', 'endDate must be on or after startDate.'));
  }

  try {
    const window = await prisma.locationWindow.update({
      where: { id: params.id },
      data: {
        ...(locationId !== undefined && { locationId }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(notes !== undefined && { notes })
      },
      include: { location: { select: { id: true, name: true } } }
    });
    return jsonOk(window);
  } catch {
    return jsonError(createApiError('NOT_FOUND', 'Location window not found.'));
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  try {
    await prisma.locationWindow.delete({ where: { id: params.id } });
    return jsonOk({ id: params.id });
  } catch {
    return jsonError(createApiError('NOT_FOUND', 'Location window not found.'));
  }
};
