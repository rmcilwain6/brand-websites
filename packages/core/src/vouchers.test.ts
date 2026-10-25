import { describe, expect, it } from 'vitest';

import {
  VOUCHER_CODE_ALPHABET,
  generateVoucherCode,
  isVoucherCode,
  normalizeVoucherCode
} from './vouchers';

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
