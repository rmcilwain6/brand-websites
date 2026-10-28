import {
  VoucherUpdateSchema,
  createApiError,
  jsonError,
  jsonOk,
  parseJson,
  toVoucherDiscount,
  voucherDiscountColumns
} from '@repo/core';
import { type Prisma, prisma } from '@repo/db';

import { requireAdminSession } from '../../../lib/auth';

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const voucher = await prisma.voucher.findUnique({ where: { id: params.id } });
  if (!voucher) {
    return jsonError(createApiError('NOT_FOUND', 'Voucher not found.'), 404);
  }

  return jsonOk(voucher);
};

/**
 * Admin edits. Changing `status` keeps the timestamps in step with it: `activatedAt` is stamped
 * the first time it goes ACTIVE (and cleared if it goes back to PENDING), `redeemedAt` and
 * `voidedAt` are set on entering REDEEMED / VOID and cleared on leaving them. Sending
 * `redeemedBookingId` marks it REDEEMED on that booking. Unlike the booking page's redeem
 * button, this works from any status: it's Reed's manual override.
 */
export const PATCH = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, VoucherUpdateSchema);
  if (!result.ok) return jsonError(result.error);
  const {
    status,
    redeemedBookingId,
    expiresAt,
    discountType,
    amountCents,
    percentOff,
    holderName,
    holderContact,
    notes
  } = result.data;

  const voucher = await prisma.voucher.findUnique({ where: { id: params.id } });
  if (!voucher) {
    return jsonError(createApiError('NOT_FOUND', 'Voucher not found.'), 404);
  }

  if (redeemedBookingId) {
    if (status && status !== 'REDEEMED') {
      return jsonError(
        createApiError('VALIDATION_ERROR', 'A voucher redeemed on a booking must be REDEEMED.'),
        400
      );
    }
    if (redeemedBookingId === voucher.sourceBookingId) {
      return jsonError(
        createApiError(
          'VALIDATION_ERROR',
          'A voucher can’t be used on the booking that earned it.'
        ),
        400
      );
    }
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: redeemedBookingId },
      select: { id: true }
    });
    if (!booking) {
      return jsonError(createApiError('NOT_FOUND', 'Booking not found.'), 404);
    }
  }

  const now = new Date();
  const nextStatus = redeemedBookingId ? 'REDEEMED' : (status ?? voucher.status);
  const data: Prisma.VoucherUncheckedUpdateInput = {};

  if (holderName !== undefined) data.holderName = holderName || null;
  if (holderContact !== undefined) data.holderContact = holderContact || null;
  if (notes !== undefined) data.notes = notes || null;
  if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;

  if (discountType) {
    // The schema has already checked the matching amount or percentage was sent.
    const discount = toVoucherDiscount({
      discountType,
      amountCents: amountCents ?? null,
      percentOff: percentOff ?? null
    });
    if (discount) Object.assign(data, voucherDiscountColumns(discount));
  }

  if (nextStatus !== voucher.status || redeemedBookingId) {
    data.status = nextStatus;
    data.activatedAt =
      nextStatus === 'PENDING'
        ? null
        : (voucher.activatedAt ?? (nextStatus === 'ACTIVE' ? now : null));
    data.redeemedAt = nextStatus === 'REDEEMED' ? now : null;
    data.voidedAt = nextStatus === 'VOID' ? (voucher.voidedAt ?? now) : null;
    if (redeemedBookingId) data.redeemedBookingId = redeemedBookingId;
    else if (nextStatus !== 'REDEEMED') data.redeemedBookingId = null;
  }

  const updated = await prisma.voucher.update({ where: { id: voucher.id }, data });
  return jsonOk(updated);
};
