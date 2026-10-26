import {
  buildModifierLineItems,
  formatVoucherDiscount,
  heardFromLabel,
  normalizeVoucherCode,
  toVoucherDiscount
} from '@repo/core';
import { Prisma, prisma } from '@repo/db';

import type { BookingEmailData, VoucherCheck } from '../../emails/components/types';

/**
 * Builds the booking emails from the saved booking, so the first send and a resend from the
 * admin show the same thing.
 */

export const bookingEmailInclude = {
  inquiry: true,
  package: { include: { modifiers: { orderBy: { sortOrder: 'asc' } } } },
  referralVoucher: true
} satisfies Prisma.BookingRequestInclude;

export type BookingForEmail = Prisma.BookingRequestGetPayload<{
  include: typeof bookingEmailInclude;
}>;

type VoucherRow = Prisma.VoucherGetPayload<Record<string, never>>;

/** What the booking form put in `Inquiry.payload`. */
type BookingPayload = {
  location?: string;
  packageName?: string | null;
  estimatedTotalCents?: number | null;
  preferredDate?: string;
  preferredTime?: string | null;
};

type SelectedOptions = {
  modifierIds?: string[];
  modifierValues?: Record<string, number>;
};

const toYmd = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

const discountLabel = (row: VoucherRow) => {
  const discount = toVoucherDiscount(row);
  return discount ? formatVoucherDiscount(discount) : null;
};

const sameName = (a: string, b: string) =>
  a.trim().toLowerCase().replace(/\s+/g, ' ') === b.trim().toLowerCase().replace(/\s+/g, ' ');

/** What a typed voucher code matches. `voucher` is the row found for its normalised code, if any. */
export const checkEnteredVoucher = (
  entered: string,
  voucher: VoucherRow | null,
  now: Date
): VoucherCheck => {
  const code = normalizeVoucherCode(entered);
  if (!code) return { verdict: 'malformed' };
  if (!voucher) return { verdict: 'unknown', code };

  const expired = voucher.expiresAt !== null && voucher.expiresAt < now;
  const verdict =
    voucher.status === 'REDEEMED'
      ? 'redeemed'
      : voucher.status === 'VOID'
        ? 'void'
        : expired
          ? 'expired'
          : voucher.status === 'PENDING'
            ? 'pending'
            : 'valid';

  return {
    verdict,
    code: voucher.code,
    holderName: voucher.holderName,
    discountLabel: discountLabel(voucher),
    expiresOn: toYmd(voucher.expiresAt)
  };
};

/** Email data for a booking. Returns null for a booking with no inquiry, which shouldn't exist. */
export const toBookingEmailData = (
  booking: BookingForEmail,
  enteredVoucher: VoucherRow | null,
  { now, adminOrigin }: { now: Date; adminOrigin?: string }
): BookingEmailData | null => {
  const { inquiry } = booking;
  if (!inquiry) return null;

  const payload = (inquiry.payload ?? {}) as BookingPayload;
  const selected = booking.selectedOptions as SelectedOptions | null;

  const modifierLineItems =
    booking.package && selected
      ? buildModifierLineItems(booking.package.modifiers, {
          selectedIds: selected.modifierIds ?? [],
          values: selected.modifierValues ?? {}
        })
      : undefined;

  const voucher = booking.referralVoucher;

  return {
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone ?? undefined,
    location: payload.location ?? '',
    preferredDate: payload.preferredDate ?? toYmd(booking.requestedAt) ?? '',
    preferredTime: payload.preferredTime ?? undefined,
    packageName: payload.packageName ?? undefined,
    estimatedTotalCents: payload.estimatedTotalCents ?? undefined,
    notes: inquiry.message ?? undefined,
    inquiryId: inquiry.id,
    modifierLineItems,
    locationIdeas: booking.locationIdeas ?? undefined,
    heardFrom: heardFromLabel(booking.heardFrom) ?? undefined,
    referrer: booking.referrerName
      ? {
          name: booking.referrerName,
          contact: booking.referrerContact ?? undefined,
          sameAsBooker: sameName(booking.referrerName, inquiry.name)
        }
      : undefined,
    referralVoucher: voucher
      ? {
          code: voucher.code,
          discountLabel: discountLabel(voucher),
          expiresOn: toYmd(voucher.expiresAt)
        }
      : undefined,
    voucherEntered: booking.voucherCodeEntered
      ? {
          entered: booking.voucherCodeEntered,
          check: checkEnteredVoucher(booking.voucherCodeEntered, enteredVoucher, now)
        }
      : undefined,
    adminUrl: adminOrigin ? `${adminOrigin}/bookings/${booking.id}` : undefined
  };
};

/** Loads a booking and the voucher its entered code points at, and builds its email data. */
export const loadBookingEmailData = async (
  bookingId: string,
  adminOrigin?: string
): Promise<BookingEmailData | null> => {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: bookingEmailInclude
  });
  if (!booking) return null;

  const code = booking.voucherCodeEntered && normalizeVoucherCode(booking.voucherCodeEntered);
  const enteredVoucher = code ? await prisma.voucher.findUnique({ where: { code } }) : null;

  return toBookingEmailData(booking, enteredVoucher, { now: new Date(), adminOrigin });
};
