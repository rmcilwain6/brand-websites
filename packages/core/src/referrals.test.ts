import { describe, expect, it } from 'vitest';

import { HEARD_FROM_OPTIONS, REFERRAL, heardFromLabel, referralExpiresAt } from './referrals';

describe('REFERRAL', () => {
  it('is $25 off and expires at the end of 2027', () => {
    expect(REFERRAL.discount).toEqual({ discountType: 'FIXED_AMOUNT', amountCents: 2500 });
    expect(referralExpiresAt().toISOString()).toBe('2027-12-31T23:59:59.999Z');
  });
});

describe('heardFromLabel', () => {
  it('maps stored values to labels', () => {
    for (const { value, label } of HEARD_FROM_OPTIONS) {
      expect(heardFromLabel(value)).toBe(label);
    }
  });

  it('falls back to the raw value, or null', () => {
    expect(heardFromLabel('billboard')).toBe('billboard');
    expect(heardFromLabel(null)).toBeNull();
  });
});
