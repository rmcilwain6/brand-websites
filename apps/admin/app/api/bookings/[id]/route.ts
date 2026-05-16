import {
  BookingRequestUpdateSchema,
  createApiError,
  jsonError,
  jsonOk,
  parseJson
} from '@repo/core';
import { prisma } from '@repo/db';

import { requireAdminSession } from '../../../lib/auth';

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: params.id },
    include: {
      inquiry: true,
      package: { include: { modifiers: { orderBy: { sortOrder: 'asc' } } } },
      timeSlot: true
    }
  });

  if (!booking) {
    return jsonError(createApiError('NOT_FOUND', 'Booking not found.'), 404);
  }

  return jsonOk(booking);
};

export const PATCH = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, BookingRequestUpdateSchema);
  if (!result.ok) return jsonError(result.error);

  try {
    const booking = await prisma.bookingRequest.update({
      where: { id: params.id },
      data: result.data
    });
    return jsonOk(booking);
  } catch {
    return jsonError(createApiError('NOT_FOUND', 'Booking not found.'), 404);
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.bookingRequest.findUnique({
        where: { id: params.id },
        select: { inquiryId: true }
      });
      if (!booking) throw new Error('NOT_FOUND');

      await tx.bookingRequest.delete({ where: { id: params.id } });
      if (booking.inquiryId) {
        await tx.inquiry.delete({ where: { id: booking.inquiryId } });
      }
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      return jsonError(createApiError('NOT_FOUND', 'Booking not found.'), 404);
    }
    return jsonError(createApiError('INTERNAL', 'Failed to delete booking.'));
  }

  return jsonOk({ deleted: true });
};
