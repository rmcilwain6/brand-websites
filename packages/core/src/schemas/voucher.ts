import { z } from 'zod';

import { VOUCHER_STATUSES, VOUCHER_TYPES } from '../vouchers';

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();

/** Manual voucher creation in the admin. The code is generated server-side. */
export const VoucherCreateSchema = z.object({
  type: z.enum(VOUCHER_TYPES).default('REFERRAL'),
  amountCents: z.number().int().positive(),
  referrerName: optionalText(200),
  referrerContact: optionalText(200),
  holderName: optionalText(200),
  holderContact: optionalText(200),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  notes: optionalText(2000)
});

/**
 * Admin edits to an existing voucher. Changing `status` stamps the matching
 * timestamp server-side; `redeemedBookingId` is set when marking it redeemed.
 */
export const VoucherUpdateSchema = z.object({
  status: z.enum(VOUCHER_STATUSES).optional(),
  holderName: optionalText(200),
  holderContact: optionalText(200),
  redeemedBookingId: z.string().min(1).nullable().optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  notes: optionalText(2000)
});

export type VoucherCreate = z.infer<typeof VoucherCreateSchema>;
export type VoucherUpdate = z.infer<typeof VoucherUpdateSchema>;
