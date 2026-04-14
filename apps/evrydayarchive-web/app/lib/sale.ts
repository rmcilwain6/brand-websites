/**
 * Spring Sale — May 2026 promotion.
 *
 * Any session booked for May 2026 receives 10% off.
 * The announcement bar is visible from mid-April through end of May.
 *
 * Remove or update this file when the sale ends.
 */

export const SALE = {
  name: 'Spring Sale',
  discountRate: 0.1,
  discountLabel: '10% off',
  /** Month (0-indexed) in which submitted bookings get the discount. May = 4. */
  discountMonth: 4,
  discountYear: 2026
} as const;

/**
 * True while the announcement bar should be visible.
 * Runs from now through end of May 2026.
 */
export function isSaleAnnouncementActive(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  if (year < 2026) return true; // before 2026 — show during development
  if (year > 2026) return false;
  return month <= SALE.discountMonth; // Jan–May 2026
}

/**
 * True when a booking submitted right now qualifies for the discount (May 2026 only).
 */
export function isSaleDiscountActive(): boolean {
  const now = new Date();
  return now.getFullYear() === SALE.discountYear && now.getMonth() === SALE.discountMonth;
}

/** Apply the sale discount to a price in cents, rounding to nearest cent. */
export function applyDiscount(cents: number): number {
  return Math.round(cents * (1 - SALE.discountRate));
}
