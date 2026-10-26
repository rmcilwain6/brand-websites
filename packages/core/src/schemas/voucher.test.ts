import { describe, expect, it } from 'vitest';

import {
  VoucherCreateSchema,
  VoucherDiscountSchema,
  VoucherSendSchema,
  VoucherUpdateSchema
} from './voucher';

describe('VoucherDiscountSchema', () => {
  it('accepts a fixed amount or a percentage', () => {
    expect(
      VoucherDiscountSchema.safeParse({ discountType: 'FIXED_AMOUNT', amountCents: 2500 }).success
    ).toBe(true);
    expect(
      VoucherDiscountSchema.safeParse({ discountType: 'PERCENTAGE', percentOff: 15 }).success
    ).toBe(true);
  });

  it('requires the value that matches the type', () => {
    expect(
      VoucherDiscountSchema.safeParse({ discountType: 'FIXED_AMOUNT', percentOff: 15 }).success
    ).toBe(false);
    expect(
      VoucherDiscountSchema.safeParse({ discountType: 'PERCENTAGE', amountCents: 2500 }).success
    ).toBe(false);
  });

  it('keeps percentages between 1 and 100, whole numbers only', () => {
    for (const percentOff of [1, 50, 100]) {
      expect(
        VoucherDiscountSchema.safeParse({ discountType: 'PERCENTAGE', percentOff }).success
      ).toBe(true);
    }
    for (const percentOff of [0, 101, 12.5, -5]) {
      expect(
        VoucherDiscountSchema.safeParse({ discountType: 'PERCENTAGE', percentOff }).success
      ).toBe(false);
    }
  });

  it('requires a positive whole fixed amount', () => {
    for (const amountCents of [0, -100, 25.5]) {
      expect(
        VoucherDiscountSchema.safeParse({ discountType: 'FIXED_AMOUNT', amountCents }).success
      ).toBe(false);
    }
  });
});

describe('VoucherCreateSchema', () => {
  it('creates a fixed-amount voucher and defaults the type to REFERRAL', () => {
    const result = VoucherCreateSchema.parse({
      discountType: 'FIXED_AMOUNT',
      amountCents: 2500,
      holderName: 'Sam'
    });
    expect(result).toMatchObject({
      type: 'REFERRAL',
      discountType: 'FIXED_AMOUNT',
      amountCents: 2500
    });
  });

  it('creates a percentage voucher', () => {
    const result = VoucherCreateSchema.parse({ discountType: 'PERCENTAGE', percentOff: 20 });
    expect(result).toMatchObject({ discountType: 'PERCENTAGE', percentOff: 20 });
  });

  it('drops the value that does not apply to the type', () => {
    const result = VoucherCreateSchema.parse({
      discountType: 'PERCENTAGE',
      percentOff: 20,
      amountCents: 2500
    });
    expect(result).not.toHaveProperty('amountCents');
  });

  it('requires a discount type and value', () => {
    expect(VoucherCreateSchema.safeParse({}).success).toBe(false);
    expect(VoucherCreateSchema.safeParse({ amountCents: 2500 }).success).toBe(false);
    expect(VoucherCreateSchema.safeParse({ discountType: 'PERCENTAGE' }).success).toBe(false);
  });

  it('rejects unknown voucher types', () => {
    expect(
      VoucherCreateSchema.safeParse({
        discountType: 'FIXED_AMOUNT',
        amountCents: 2500,
        type: 'GIFT'
      }).success
    ).toBe(false);
  });
});

describe('VoucherUpdateSchema', () => {
  it('accepts each status', () => {
    for (const status of ['PENDING', 'ACTIVE', 'REDEEMED', 'VOID']) {
      expect(VoucherUpdateSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it('rejects an unknown status', () => {
    expect(VoucherUpdateSchema.safeParse({ status: 'USED' }).success).toBe(false);
  });

  it('allows clearing the redeemed booking', () => {
    expect(VoucherUpdateSchema.safeParse({ redeemedBookingId: null }).success).toBe(true);
  });

  it('allows switching the value between fixed and percentage', () => {
    expect(
      VoucherUpdateSchema.safeParse({ discountType: 'PERCENTAGE', percentOff: 10 }).success
    ).toBe(true);
    expect(
      VoucherUpdateSchema.safeParse({ discountType: 'FIXED_AMOUNT', amountCents: 5000 }).success
    ).toBe(true);
  });

  it('rejects a value without its type, or a type without its value', () => {
    expect(VoucherUpdateSchema.safeParse({ percentOff: 10 }).success).toBe(false);
    expect(VoucherUpdateSchema.safeParse({ amountCents: 5000 }).success).toBe(false);
    expect(VoucherUpdateSchema.safeParse({ discountType: 'PERCENTAGE' }).success).toBe(false);
  });

  it('rejects both values at once', () => {
    expect(
      VoucherUpdateSchema.safeParse({
        discountType: 'PERCENTAGE',
        percentOff: 10,
        amountCents: 500
      }).success
    ).toBe(false);
  });
});

describe('VoucherSendSchema', () => {
  it('accepts an email address, trimmed', () => {
    expect(VoucherSendSchema.parse({ to: '  sam@example.com ' })).toEqual({
      to: 'sam@example.com'
    });
  });

  it('rejects anything that is not an email address', () => {
    expect(VoucherSendSchema.safeParse({ to: '@sam.makes' }).success).toBe(false);
    expect(VoucherSendSchema.safeParse({}).success).toBe(false);
  });
});
