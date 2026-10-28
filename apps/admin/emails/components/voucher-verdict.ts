import type { VoucherCheck } from './types';
import type { BadgeTone } from './ui';

/** How each voucher check reads at a glance, and what to do about it. */
export const VOUCHER_VERDICT: Record<
  VoucherCheck['verdict'],
  { tone: BadgeTone; badge: string; summary: string }
> = {
  valid: { tone: 'good', badge: 'Valid', summary: 'Active and in date.' },
  pending: {
    tone: 'warn',
    badge: 'Not active yet',
    summary: 'This code exists but is still Pending, so its holder hasn’t been sent it yet.'
  },
  redeemed: {
    tone: 'bad',
    badge: 'Already used',
    summary: 'This voucher has already been redeemed.'
  },
  void: { tone: 'bad', badge: 'Void', summary: 'This voucher has been voided.' },
  expired: { tone: 'bad', badge: 'Expired', summary: 'This voucher is past its expiry date.' },
  unknown: {
    tone: 'bad',
    badge: 'No match',
    summary: 'No voucher has this code. They may have mistyped it.'
  },
  malformed: {
    tone: 'bad',
    badge: 'Not a code',
    summary: 'This doesn’t look like a voucher code (EAC-XXXX).'
  }
};
