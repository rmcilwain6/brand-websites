import {
  BookingFormSchema,
  REFERRAL,
  buildModifierLineItems,
  generateVoucherCode,
  jsonError,
  jsonOk,
  parseJson,
  referralExpiresAt,
  voucherDiscountColumns,
  type ModifierLineItem
} from '@repo/core';
import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { sendBookingConfirmation, sendBookingNotification } from '../../../lib/email';

// TODO: Rate limiting — add per-IP limits when infrastructure supports it.

/** Generated codes are random, so a clash is rare; retry with a fresh code a few times. */
const MAX_VOUCHER_CODE_ATTEMPTS = 5;

const isVoucherCodeCollision = (error: unknown): boolean =>
  error instanceof PrismaClientKnownRequestError &&
  error.code === 'P2002' &&
  [error.meta?.target].flat().some((t) => typeof t === 'string' && t.includes('code'));

export const POST = async (req: Request): Promise<Response> => {
  const result = await parseJson(req, BookingFormSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  const {
    name,
    email,
    phone,
    location,
    preferredDate,
    preferredTime,
    notes,
    packageId,
    packageName,
    modifierIds,
    modifierValues,
    estimatedTotalCents,
    locationIdeas,
    referrerName,
    referrerContact,
    voucherCode,
    heardFrom,
    website
  } = result.data;

  // Honeypot: the field is hidden from people, so a value means a bot. Answer like a
  // normal success so it doesn't retry, but save nothing and send no email.
  if (website) {
    console.warn('[bookings] Dropped honeypot submission');
    return jsonOk({ inquiryId: null });
  }

  // Combine date + optional time into a DateTime for BookingRequest.requestedAt.
  // Time defaults to midnight if not provided; stored as UTC.
  const timePart = preferredTime ?? '00:00';
  const requestedAt = new Date(`${preferredDate}T${timePart}:00`);

  // A booking that names a referrer earns them one PENDING referral voucher, created
  // in the same write as the booking. The holder starts as the referrer.
  const referralVoucher = (code: string) =>
    referrerName
      ? {
          create: {
            code,
            type: 'REFERRAL' as const,
            status: 'PENDING' as const,
            ...voucherDiscountColumns(REFERRAL.discount),
            referrerName,
            referrerContact: referrerContact ?? null,
            holderName: referrerName,
            holderContact: referrerContact ?? null,
            expiresAt: referralExpiresAt()
          }
        }
      : undefined;

  const createInquiry = (newVoucherCode: string) =>
    prisma.inquiry.create({
      data: {
        type: 'BOOKING_REQUEST',
        name,
        email,
        phone: phone ?? null,
        message: notes ?? null,
        payload: {
          location,
          packageName: packageName ?? null,
          modifierIds,
          modifierValues: modifierValues ?? null,
          estimatedTotalCents: estimatedTotalCents ?? null,
          preferredDate,
          preferredTime: preferredTime ?? null
        },
        bookingRequest: {
          create: {
            packageId: packageId ?? null,
            requestedAt: isNaN(requestedAt.getTime()) ? null : requestedAt,
            notes: notes ?? null,
            selectedOptions: { modifierIds, modifierValues: modifierValues ?? {} },
            locationIdeas: locationIdeas ?? null,
            referrerName: referrerName ?? null,
            referrerContact: referrerContact ?? null,
            voucherCodeEntered: voucherCode ?? null,
            heardFrom: heardFrom ?? null,
            referralVoucher: referralVoucher(newVoucherCode)
          }
        }
      },
      include: { bookingRequest: true }
    });

  const createWithFreshCode = async () => {
    for (let attempt = 1; ; attempt++) {
      try {
        return await createInquiry(generateVoucherCode());
      } catch (error) {
        const retry =
          referrerName && isVoucherCodeCollision(error) && attempt < MAX_VOUCHER_CODE_ATTEMPTS;
        if (!retry) throw error;
      }
    }
  };

  let inquiry;
  try {
    inquiry = await createWithFreshCode();
  } catch (error) {
    console.error('[bookings] Failed to persist booking request', error);
    return jsonError({ code: 'INTERNAL', message: 'Failed to save booking request.' });
  }

  // ── Build modifier line items for the email receipt ───────────────────────
  let modifierLineItems: ModifierLineItem[] | undefined;

  if (packageId) {
    const pkgRecord = await prisma.package
      .findUnique({
        where: { id: packageId },
        select: {
          modifiers: {
            select: {
              id: true,
              name: true,
              type: true,
              isRequired: true,
              priceDeltaCents: true,
              config: true
            },
            orderBy: { sortOrder: 'asc' }
          }
        }
      })
      .catch(() => null);

    if (pkgRecord) {
      modifierLineItems = buildModifierLineItems(pkgRecord.modifiers, {
        selectedIds: modifierIds ?? [],
        values: modifierValues ?? {}
      });
    }
  }

  // ── Emails ────────────────────────────────────────────────────────────────
  const emailData = {
    name,
    email,
    phone: phone ?? undefined,
    location,
    preferredDate,
    preferredTime: preferredTime ?? undefined,
    packageName: packageName ?? undefined,
    estimatedTotalCents: estimatedTotalCents ?? undefined,
    notes: notes ?? undefined,
    inquiryId: inquiry.id,
    modifierLineItems
  };

  try {
    await Promise.all([sendBookingConfirmation(emailData), sendBookingNotification(emailData)]);
    await prisma.bookingRequest.update({
      where: { id: inquiry.bookingRequest!.id },
      data: { emailSentAt: new Date() }
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[bookings] Email send failed', { inquiryId: inquiry.id, err });
    await prisma.bookingRequest
      .update({
        where: { id: inquiry.bookingRequest!.id },
        data: { emailError: errorMsg }
      })
      .catch(() => {});
  }

  return jsonOk({ inquiryId: inquiry.id });
};
