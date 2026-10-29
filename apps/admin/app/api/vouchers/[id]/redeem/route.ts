import { VoucherRedeemSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';
import { prisma } from '@repo/db';

import { requireAdminSession } from '../../../../lib/auth';

/**
 * Marks an ACTIVE voucher as used on a booking. Redemption is manual (spec §5.3): Reed takes
 * the discount off when he confirms the price, then records it here.
 */
export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, VoucherRedeemSchema);
  if (!result.ok) return jsonError(result.error);
  const { bookingId } = result.data;

  const voucher = await prisma.voucher.findUnique({ where: { id: params.id } });
  if (!voucher) {
    return jsonError(createApiError('NOT_FOUND', 'Voucher not found.'), 404);
  }

  const now = new Date();
  const blocked =
    voucher.status === 'PENDING'
      ? 'This voucher hasn’t been sent to its holder yet.'
      : voucher.status === 'REDEEMED'
        ? 'This voucher has already been used.'
        : voucher.status === 'VOID'
          ? 'This voucher has been voided.'
          : voucher.expiresAt && voucher.expiresAt < now
            ? 'This voucher has expired.'
            : null;
  if (blocked) return jsonError(createApiError('CONFLICT', blocked), 409);

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    select: { id: true }
  });
  if (!booking) {
    return jsonError(createApiError('NOT_FOUND', 'Booking not found.'), 404);
  }

  // Only flips a voucher that is still ACTIVE, so two redeems at once can't both win.
  const { count } = await prisma.voucher.updateMany({
    where: { id: voucher.id, status: 'ACTIVE' },
    data: { status: 'REDEEMED', redeemedAt: now, redeemedBookingId: booking.id }
  });
  if (count === 0) {
    return jsonError(createApiError('CONFLICT', 'This voucher has already been used.'), 409);
  }

  return jsonOk({ ...voucher, status: 'REDEEMED', redeemedAt: now, redeemedBookingId: booking.id });
};
