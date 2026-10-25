import { z } from 'zod';

import { VOUCHER_DISCOUNT_TYPES, VOUCHER_STATUSES, VOUCHER_TYPES } from '../vouchers';

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();

const amountCents = z.number().int().positive();
const percentOff = z.number().int().min(1).max(100);

/** A voucher's value, mirroring the `VoucherDiscount` type and the DB CHECK constraint. */
export const VoucherDiscountSchema = z.discriminatedUnion('discountType', [
  z.object({ discountType: z.literal('FIXED_AMOUNT'), amountCents }),
  z.object({ discountType: z.literal('PERCENTAGE'), percentOff })
]);

const voucherDetails = {
  type: z.enum(VOUCHER_TYPES).default('REFERRAL'),
  referrerName: optionalText(200),
  referrerContact: optionalText(200),
  holderName: optionalText(200),
  holderContact: optionalText(200),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  notes: optionalText(2000)
};

/**
 * Manual voucher creation in the admin: a fixed amount or a percentage, plus details.
 * The code is generated server-side.
 */
export const VoucherCreateSchema = z.discriminatedUnion('discountType', [
  z.object({ ...voucherDetails, discountType: z.literal('FIXED_AMOUNT'), amountCents }),
  z.object({ ...voucherDetails, discountType: z.literal('PERCENTAGE'), percentOff })
]);

/**
 * Admin edits to an existing voucher. Changing `status` stamps the matching
 * timestamp server-side; `redeemedBookingId` is set when marking it redeemed.
 * To change the value, send `discountType` with its matching `amountCents` or
 * `percentOff` (the other column is cleared server-side).
 */
export const VoucherUpdateSchema = z
  .object({
    status: z.enum(VOUCHER_STATUSES).optional(),
    holderName: optionalText(200),
    holderContact: optionalText(200),
    redeemedBookingId: z.string().min(1).nullable().optional(),
    expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
    notes: optionalText(2000),
    discountType: z.enum(VOUCHER_DISCOUNT_TYPES).optional(),
    amountCents: amountCents.optional(),
    percentOff: percentOff.optional()
  })
  .superRefine((v, ctx) => {
    const touchesDiscount =
      v.discountType !== undefined || v.amountCents !== undefined || v.percentOff !== undefined;
    if (!touchesDiscount) return;
    const result = VoucherDiscountSchema.safeParse({
      discountType: v.discountType,
      amountCents: v.amountCents,
      percentOff: v.percentOff
    });
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountType'],
        message: 'Send discountType with a matching amountCents or percentOff.'
      });
      return;
    }
    const extra = v.discountType === 'FIXED_AMOUNT' ? 'percentOff' : 'amountCents';
    if (v[extra] !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [extra],
        message: `${extra} doesn't apply to a ${v.discountType} voucher.`
      });
    }
  });

export type VoucherCreate = z.infer<typeof VoucherCreateSchema>;
export type VoucherUpdate = z.infer<typeof VoucherUpdateSchema>;
