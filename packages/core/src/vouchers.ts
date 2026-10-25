/**
 * Voucher codes and statuses. Shared by the admin (creation, matching, voucher UI)
 * and anywhere a booker's entered code needs checking.
 *
 * Client components should import from '@repo/core/vouchers' rather than '@repo/core'.
 */

export const VOUCHER_TYPES = ['REFERRAL'] as const;
export type VoucherType = (typeof VOUCHER_TYPES)[number];

export const VOUCHER_STATUSES = ['PENDING', 'ACTIVE', 'REDEEMED', 'VOID'] as const;
export type VoucherStatus = (typeof VOUCHER_STATUSES)[number];

export const VOUCHER_CODE_PREFIX = 'EAC-';
export const VOUCHER_CODE_LENGTH = 4;

/** A–Z and 2–9, minus the confusable 0/O and 1/I/L. */
export const VOUCHER_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const CODE_PATTERN = new RegExp(`^EAC-[${VOUCHER_CODE_ALPHABET}]{${VOUCHER_CODE_LENGTH}}$`);

export const isVoucherCode = (value: string): boolean => CODE_PATTERN.test(value);

/**
 * A random `EAC-XXXX` code. Uniqueness is enforced by the database; callers retry
 * on a collision. Uses Web Crypto so it runs in Node and the browser alike.
 */
export const generateVoucherCode = (): string => {
  const n = VOUCHER_CODE_ALPHABET.length;
  // Reject bytes past the last whole multiple of n so every character is equally likely.
  const limit = 256 - (256 % n);
  let code = '';
  while (code.length < VOUCHER_CODE_LENGTH) {
    const bytes = crypto.getRandomValues(new Uint8Array(VOUCHER_CODE_LENGTH * 2));
    for (const b of bytes) {
      if (b < limit && code.length < VOUCHER_CODE_LENGTH) code += VOUCHER_CODE_ALPHABET[b % n];
    }
  }
  return VOUCHER_CODE_PREFIX + code;
};

/**
 * Canonical form of a code a person typed, for matching against the table:
 * "eac abcd", "EAC-ABCD " and "abcd" all become "EAC-ABCD". Returns null when the
 * input can't be a voucher code. The raw text is still what gets stored on the booking.
 */
export const normalizeVoucherCode = (input: string): string | null => {
  let chars = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (chars.length === VOUCHER_CODE_LENGTH + 3 && chars.startsWith('EAC')) chars = chars.slice(3);
  const code = VOUCHER_CODE_PREFIX + chars;
  return isVoucherCode(code) ? code : null;
};
