import {
  VoucherSendSchema,
  createApiError,
  formatVoucherDiscount,
  jsonError,
  jsonOk,
  parseJson,
  toVoucherDiscount
} from '@repo/core';
import { prisma } from '@repo/db';

import { requireAdminSession } from '../../../../lib/auth';
import { sendReferralVoucher } from '../../../../lib/email';

/**
 * Emails a voucher to its holder: the referral thank-you with the code. A PENDING voucher
 * becomes ACTIVE (the spec's "the holder has been sent their code"); sending again resends
 * the same code.
 */
export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, VoucherSendSchema);
  if (!result.ok) return jsonError(result.error);
  const { to } = result.data;

  const voucher = await prisma.voucher.findUnique({
    where: { id: params.id },
    // The booking that named the referrer, so the email can thank them for sending that person.
    include: { sourceBooking: { include: { inquiry: { select: { name: true } } } } }
  });
  if (!voucher) {
    return jsonError(createApiError('NOT_FOUND', 'Voucher not found.'), 404);
  }

  const now = new Date();
  if (voucher.status === 'REDEEMED' || voucher.status === 'VOID') {
    const state = voucher.status === 'REDEEMED' ? 'already been used' : 'been voided';
    return jsonError(createApiError('CONFLICT', `This voucher has ${state}.`), 409);
  }
  if (voucher.expiresAt && voucher.expiresAt < now) {
    return jsonError(createApiError('CONFLICT', 'This voucher has expired.'), 409);
  }

  const discount = toVoucherDiscount(voucher);
  if (!discount) {
    return jsonError(createApiError('INTERNAL', 'This voucher has no valid discount.'));
  }

  try {
    await sendReferralVoucher(to, {
      holderName: voucher.holderName ?? '',
      referredName: voucher.sourceBooking?.inquiry?.name,
      code: voucher.code,
      discountLabel: formatVoucherDiscount(discount),
      expiresOn: voucher.expiresAt ? voucher.expiresAt.toISOString().slice(0, 10) : null
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[vouchers] Send failed', { voucherId: voucher.id, err });
    return jsonError(createApiError('INTERNAL', `Email send failed: ${message}`));
  }

  const updated = await prisma.voucher.update({
    where: { id: voucher.id },
    data: {
      status: 'ACTIVE',
      activatedAt: voucher.activatedAt ?? now,
      // Keep a contact Reed already had (e.g. an Instagram handle); otherwise remember the email.
      holderContact: voucher.holderContact ?? to
    }
  });

  return jsonOk(updated);
};
