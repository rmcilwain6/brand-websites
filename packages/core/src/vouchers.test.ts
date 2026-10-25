import { describe, expect, it } from 'vitest';

import {
  VOUCHER_CODE_ALPHABET,
  formatVoucherDiscount,
  generateVoucherCode,
  isVoucherCode,
  normalizeVoucherCode,
  toVoucherDiscount,
  voucherDiscountCents,
  voucherDiscountColumns
} from './vouchers';

const fixed = (amountCents: number) => ({ discountType: 'FIXED_AMOUNT' as const, amountCents });
const percent = (percentOff: number) => ({ discountType: 'PERCENTAGE' as const, percentOff });

describe('toVoucherDiscount', () => {
  it('reads fixed and percentage rows', () => {
    expect(
      toVoucherDiscount({ discountType: 'FIXED_AMOUNT', amountCents: 2500, percentOff: null })
    ).toEqual(fixed(2500));
    expect(
      toVoucherDiscount({ discountType: 'PERCENTAGE', amountCents: null, percentOff: 15 })
    ).toEqual(percent(15));
  });

  it('returns null for a row missing its value', () => {
    expect(
      toVoucherDiscount({ discountType: 'FIXED_AMOUNT', amountCents: null, percentOff: 15 })
    ).toBeNull();
    expect(
      toVoucherDiscount({ discountType: 'PERCENTAGE', amountCents: 2500, percentOff: null })
    ).toBeNull();
  });
});

describe('voucherDiscountColumns', () => {
  it('clears the column that does not apply', () => {
    expect(voucherDiscountColumns(fixed(2500))).toEqual({
      discountType: 'FIXED_AMOUNT',
      amountCents: 2500,
      percentOff: null
    });
    expect(voucherDiscountColumns(percent(15))).toEqual({
      discountType: 'PERCENTAGE',
      amountCents: null,
      percentOff: 15
    });
  });
});

describe('formatVoucherDiscount', () => {
  it('formats whole and part dollars, and percentages', () => {
    expect(formatVoucherDiscount(fixed(2500))).toBe('$25');
    expect(formatVoucherDiscount(fixed(1250))).toBe('$12.50');
    expect(formatVoucherDiscount(percent(15))).toBe('15%');
  });
});

describe('voucherDiscountCents', () => {
  it('takes a fixed amount off', () => {
    expect(voucherDiscountCents(fixed(2500), 45000)).toBe(2500);
  });

  it('takes a percentage of the total, rounded to the cent', () => {
    expect(voucherDiscountCents(percent(15), 45000)).toBe(6750);
    expect(voucherDiscountCents(percent(15), 33333)).toBe(5000);
  });

  it('never takes off more than the total', () => {
    expect(voucherDiscountCents(fixed(2500), 1000)).toBe(1000);
    expect(voucherDiscountCents(percent(100), 45000)).toBe(45000);
    expect(voucherDiscountCents(fixed(2500), -50)).toBe(0);
  });
});

describe('VOUCHER_CODE_ALPHABET', () => {
  it('excludes confusable characters', () => {
    for (const c of ['0', 'O', '1', 'I', 'L']) {
      expect(VOUCHER_CODE_ALPHABET).not.toContain(c);
    }
  });

  it('has no duplicate characters', () => {
    expect(new Set(VOUCHER_CODE_ALPHABET).size).toBe(VOUCHER_CODE_ALPHABET.length);
  });
});

describe('generateVoucherCode', () => {
  it('produces EAC-XXXX codes from the alphabet', () => {
    for (let i = 0; i < 500; i++) {
      const code = generateVoucherCode();
      expect(code).toMatch(/^EAC-[A-Z0-9]{4}$/);
      expect(isVoucherCode(code)).toBe(true);
    }
  });

  it('uses every character in the alphabet over many codes', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      for (const c of generateVoucherCode().slice(4)) seen.add(c);
    }
    expect(seen.size).toBe(VOUCHER_CODE_ALPHABET.length);
  });
});

describe('isVoucherCode', () => {
  it('rejects confusable characters and wrong shapes', () => {
    expect(isVoucherCode('EAC-AB2C')).toBe(true);
    expect(isVoucherCode('EAC-AB0C')).toBe(false);
    expect(isVoucherCode('EAC-ABIC')).toBe(false);
    expect(isVoucherCode('EAC-ABC')).toBe(false);
    expect(isVoucherCode('eac-ab2c')).toBe(false);
  });
});

describe('normalizeVoucherCode', () => {
  it('canonicalises case, spacing, and a missing prefix', () => {
    expect(normalizeVoucherCode('EAC-AB2C')).toBe('EAC-AB2C');
    expect(normalizeVoucherCode('  eac-ab2c ')).toBe('EAC-AB2C');
    expect(normalizeVoucherCode('eac ab2c')).toBe('EAC-AB2C');
    expect(normalizeVoucherCode('EACAB2C')).toBe('EAC-AB2C');
    expect(normalizeVoucherCode('ab2c')).toBe('EAC-AB2C');
  });

  it('returns null for text that cannot be a code', () => {
    expect(normalizeVoucherCode('')).toBeNull();
    expect(normalizeVoucherCode('SUMMER25')).toBeNull();
    expect(normalizeVoucherCode('EAC-AB0C')).toBeNull();
    expect(normalizeVoucherCode('my friend gave me one')).toBeNull();
  });
});
