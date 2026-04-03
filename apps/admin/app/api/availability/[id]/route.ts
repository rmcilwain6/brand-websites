import { prisma } from '@repo/db';
import { createApiError, jsonError, jsonOk } from '@repo/core';
import { requireAdminSession } from '../../../lib/auth';
import { z } from 'zod';

const UpdateSlotSchema = z.object({
  status: z.enum(['AVAILABLE', 'HELD', 'UNAVAILABLE'])
});

export const PATCH = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const parsed = UpdateSlotSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      createApiError('VALIDATION_ERROR', 'status must be AVAILABLE, HELD, or UNAVAILABLE.')
    );
  }

  try {
    const slot = await prisma.timeSlot.update({
      where: { id: params.id },
      data: { status: parsed.data.status }
    });
    return jsonOk(slot);
  } catch {
    return jsonError(createApiError('NOT_FOUND', 'Time slot not found.'));
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  try {
    await prisma.timeSlot.delete({ where: { id: params.id } });
    return jsonOk({ id: params.id });
  } catch {
    return jsonError(createApiError('NOT_FOUND', 'Time slot not found.'));
  }
};
