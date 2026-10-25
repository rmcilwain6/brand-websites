/**
 * Referrals — the single source for the referral reward and the "how did you hear" options.
 *
 * `REFERRAL.amountCents` is stamped onto each new referral voucher and drives the
 * "$25 off" copy on /book. Change it here, not in components or email templates.
 * Vouchers already issued keep the amount they were created with.
 *
 * Client components should import from '@repo/core/referrals' rather than '@repo/core':
 * the package root re-exports every Zod schema, which would otherwise ship to the browser.
 */

export const REFERRAL = {
  amountCents: 2500,
  /** Referral vouchers are valid through the end of this day. */
  expiresOn: '2027-12-31'
} as const;

/** Expiry timestamp for a referral voucher created now (end of `REFERRAL.expiresOn`, UTC). */
export const referralExpiresAt = (): Date => new Date(`${REFERRAL.expiresOn}T23:59:59.999Z`);

export const HEARD_FROM_OPTIONS = [
  { value: 'tagged-post', label: 'Tagged in a post' },
  { value: 'friend', label: 'A friend' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'The website' },
  { value: 'other', label: 'Other' }
] as const;

export type HeardFrom = (typeof HEARD_FROM_OPTIONS)[number]['value'];

export const HEARD_FROM_VALUES = HEARD_FROM_OPTIONS.map((o) => o.value) as [
  HeardFrom,
  ...HeardFrom[]
];

export const heardFromLabel = (value: string | null | undefined): string | null =>
  HEARD_FROM_OPTIONS.find((o) => o.value === value)?.label ?? value ?? null;
