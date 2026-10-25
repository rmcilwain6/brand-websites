import { describe, expect, it } from 'vitest';

import { VoucherCreateSchema, VoucherUpdateSchema } from './voucher';

describe('VoucherCreateSchema', () => {
  it('defaults the type to REFERRAL', () => {
    const result = VoucherCreateSchema.parse({ amountCents: 2500, holderName: 'Sam' });
    expect(result.type).toBe('REFERRAL');
  });

  it('requires a positive whole amount', () => {
    expect(VoucherCreateSchema.safeParse({}).success).toBe(false);
    expect(VoucherCreateSchema.safeParse({ amountCents: 0 }).success).toBe(false);
    expect(VoucherCreateSchema.safeParse({ amountCents: 25.5 }).success).toBe(false);
  });

  it('rejects unknown voucher types', () => {
    expect(VoucherCreateSchema.safeParse({ amountCents: 2500, type: 'GIFT' }).success).toBe(false);
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
});
