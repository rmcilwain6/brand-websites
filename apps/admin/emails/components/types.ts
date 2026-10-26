import type { ModifierLineItem } from '@repo/core';

/**
 * What a voucher code typed on the booking form turned out to be. Checked when the email is
 * built, so a resend shows the voucher's current state, not its state at booking time.
 */
export type VoucherCheck =
  | {
      /** `valid`: ACTIVE and not expired. `expired` wins over PENDING/ACTIVE once past its date. */
      verdict: 'valid' | 'pending' | 'redeemed' | 'void' | 'expired';
      code: string;
      holderName: string | null;
      /** "$15", "15%". Null only if the row's discount columns are inconsistent. */
      discountLabel: string | null;
      /** YYYY-MM-DD, or null for no expiry. */
      expiresOn: string | null;
    }
  /** Looks like a code, but no voucher has it. */
  | { verdict: 'unknown'; code: string }
  /** Doesn't look like an EAC-XXXX code at all. */
  | { verdict: 'malformed' };

/** Everything both booking emails can show. The client confirmation uses only the booker-facing parts. */
export type BookingEmailData = {
  name: string;
  email: string;
  phone?: string;
  location: string;
  /** YYYY-MM-DD */
  preferredDate: string;
  /** HH:mm, 24-hour */
  preferredTime?: string;
  packageName?: string;
  /** The package's base price, the first line of the receipt. */
  packageBasePriceCents?: number;
  estimatedTotalCents?: number;
  notes?: string;
  inquiryId: string;
  modifierLineItems?: ModifierLineItem[];
  /** "Anywhere in mind?" */
  locationIdeas?: string;
  /** The label shown on the form, e.g. "Instagram". */
  heardFrom?: string;
  referrer?: {
    name: string;
    contact?: string;
    /** The referrer's name matches the booker's: possibly a self-referral. */
    sameAsBooker: boolean;
  };
  /** The voucher this booking created for its referrer. Reed-only. */
  referralVoucher?: {
    code: string;
    discountLabel: string | null;
    /** YYYY-MM-DD, or null for no expiry. */
    expiresOn: string | null;
  };
  /** The code the booker typed, exactly as typed, and what it matched. */
  voucherEntered?: { entered: string; check: VoucherCheck };
  /** This booking's page in the admin. */
  adminUrl?: string;
};
