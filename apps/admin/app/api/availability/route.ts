import { prisma } from '@repo/db';
import { createApiError, jsonError, jsonOk } from '@repo/core';
import { requireAdminSession } from '../../lib/auth';
import { z } from 'zod';

const CreateSlotSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime()
});

export const GET = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const slots = await prisma.timeSlot.findMany({
    orderBy: { startsAt: 'asc' }
  });

  return jsonOk(slots);
};

export const POST = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const parsed = CreateSlotSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      createApiError('VALIDATION_ERROR', 'startsAt and endsAt must be valid ISO datetimes.')
    );
  }

  const { startsAt, endsAt } = parsed.data;

  if (new Date(endsAt) <= new Date(startsAt)) {
    return jsonError(createApiError('VALIDATION_ERROR', 'endsAt must be after startsAt.'));
  }

  const slot = await prisma.timeSlot.create({
    data: { startsAt: new Date(startsAt), endsAt: new Date(endsAt) }
  });

  return jsonOk(slot);
};
