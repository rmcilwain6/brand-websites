import { prisma } from '@repo/db';
import { createApiError, jsonError, jsonOk } from '@repo/core';
import { requireAdminSession } from '../../lib/auth';
import { z } from 'zod';

const CreateWindowSchema = z.object({
  locationId: z.string().min(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
  notes: z.string().optional()
});

export const GET = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const windows = await prisma.locationWindow.findMany({
    include: { location: { select: { id: true, name: true } } },
    orderBy: { startDate: 'asc' }
  });

  return jsonOk(windows);
};

export const POST = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const parsed = CreateWindowSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      createApiError('VALIDATION_ERROR', 'locationId, startDate, and endDate are required.')
    );
  }

  const { locationId, startDate, endDate, notes } = parsed.data;

  if (new Date(endDate) < new Date(startDate)) {
    return jsonError(createApiError('VALIDATION_ERROR', 'endDate must be on or after startDate.'));
  }

  const window = await prisma.locationWindow.create({
    data: {
      locationId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes: notes ?? null
    },
    include: { location: { select: { id: true, name: true } } }
  });

  return jsonOk(window);
};
