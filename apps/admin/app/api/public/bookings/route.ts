import {
  BookingFormSchema,
  CAMPAIGN,
  REFERRAL,
  generateVoucherCode,
  isCampaignEligible,
  jsonError,
  jsonOk,
  parseJson,
  referralExpiresAt,
  voucherDiscountColumns,
  type BookingFormInput
} from '@repo/core';
import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { loadBookingEmailData } from '../../../lib/booking-email-data';
import { sendBookingConfirmation, sendBookingNotification } from '../../../lib/email';

// TODO: Rate limiting — add per-IP limits when infrastructure supports it.

/** Generated codes are random, so a clash is rare; retry with a fresh code a few times. */
const MAX_VOUCHER_CODE_ATTEMPTS = 5;

const isVoucherCodeCollision = (error: unknown): boolean =>
  error instanceof PrismaClientKnownRequestError &&
  error.code === 'P2002' &&
  [error.meta?.target].flat().some((t) => typeof t === 'string' && t.includes('code'));

/**
 * The campaign columns for a booking, which stays a regular booking unless its package is
 * eligible. An ineligible package drops the application quietly: the session request still
 * matters more than the opt-in, so it should never fail the booking.
 */
const campaignColumns = async ({
  applyToCampaign,
  campaignAnswers,
  packageId
}: Pick<BookingFormInput, 'applyToCampaign' | 'campaignAnswers' | 'packageId'>) => {
  if (!applyToCampaign || !campaignAnswers || !packageId) return {};

  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { slug: true }
  });
  if (!isCampaignEligible(pkg?.slug)) return {};

  const { whatWorkingOn, aboutIt, link, othersInvolved } = campaignAnswers;
  return {
    campaign: CAMPAIGN.id,
    applicantStatus: 'PENDING' as const,
    campaignAnswers: {
      whatWorkingOn: whatWorkingOn ?? null,
      aboutIt: aboutIt ?? null,
      link: link ?? null,
      othersInvolved: othersInvolved ?? null,
      // Stamped here rather than sent by the browser, so the record can be relied on.
      acknowledgedAt: new Date().toISOString(),
      ackVersion: CAMPAIGN.ackVersion
    }
  };
};

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

  const createInquiry = (
    newVoucherCode: string,
    campaign: Awaited<ReturnType<typeof campaignColumns>>
  ) =>
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
            ...campaign,
            referralVoucher: referralVoucher(newVoucherCode)
          }
        }
      },
      include: { bookingRequest: true }
    });

  const createWithFreshCode = async () => {
    const campaign = await campaignColumns(result.data);
    for (let attempt = 1; ; attempt++) {
      try {
        return await createInquiry(generateVoucherCode(), campaign);
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

  // ── Emails ────────────────────────────────────────────────────────────────
  // Built from the saved booking (the same path a resend from the admin takes), so they show
  // the referral voucher just created and what any entered voucher code matches.
  const bookingId = inquiry.bookingRequest!.id;

  try {
    const emailData = await loadBookingEmailData(bookingId, new URL(req.url).origin);
    if (!emailData) throw new Error('Booking not found after saving it.');
    await Promise.all([sendBookingConfirmation(emailData), sendBookingNotification(emailData)]);
    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: { emailSentAt: new Date() }
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[bookings] Email send failed', { inquiryId: inquiry.id, err });
    await prisma.bookingRequest
      .update({
        where: { id: bookingId },
        data: { emailError: errorMsg }
      })
      .catch(() => {});
  }

  return jsonOk({ inquiryId: inquiry.id });
};
