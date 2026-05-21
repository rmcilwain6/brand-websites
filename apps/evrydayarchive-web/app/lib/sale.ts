/**
 * Spring Sale — extended through June 4th, 2026.
 *
 * Any session booked for May–June 4th 2026 receives 10% off.
 * The announcement bar is visible from mid-April through June 4th.
 *
 * Remove or update this file when the sale ends.
 */

export const SALE = {
  name: 'Spring Sale',
  discountRate: 0.1,
  discountLabel: '10% off',
  /** First session date (inclusive) that qualifies for the discount. YYYY-MM-DD. */
  discountStartDate: '2026-05-01',
  /** Last session date (inclusive) that qualifies for the discount. YYYY-MM-DD. */
  discountEndDate: '2026-06-04'
} as const;

/**
 * True while the announcement bar should be visible.
 * Runs from now through June 4th, 2026.
 */
export function isSaleAnnouncementActive(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  if (year < 2026) return true; // before 2026 — show during development
  if (year > 2026) return false;
  // End of day on June 4th 2026
  return now <= new Date('2026-06-04T23:59:59');
}

/**
 * True while the sale is active — the window when the Spring Sale toggle should be
 * pre-selected for users who land on the builder or booking page without having opted in.
 */
export function isSaleAutoOptIn(): boolean {
  return isSaleAnnouncementActive();
}

/**
 * True when a booking submitted right now qualifies for the discount (through June 4th 2026).
 */
export function isSaleDiscountActive(): boolean {
  return isSaleAnnouncementActive();
}

/** Apply the sale discount to a price in cents, rounding to nearest cent. */
export function applyDiscount(cents: number): number {
  return Math.round(cents * (1 - SALE.discountRate));
}

/**
 * Returns true if a YYYY-MM-DD date string falls within the sale's discount window
 * (May 1 – June 4, 2026 inclusive). Used client-side on the booking page to validate
 * the selected shoot date.
 */
export function isSaleDate(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr >= SALE.discountStartDate && dateStr <= SALE.discountEndDate;
}
