import { BookingFormSchema, jsonError, jsonOk, parseJson } from '@repo/core';
import { prisma } from '@repo/db';

import { sendBookingNotification } from '../../lib/email';

// TODO: Rate limiting — add per-IP limits when infrastructure supports it.

export const POST = async (req: Request): Promise<Response> => {
  const result = await parseJson(req, BookingFormSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  const {
    name,
    email,
    phone,
    preferredDate,
    preferredTime,
    notes,
    packageId,
    packageName,
    modifierIds,
    estimatedTotalCents
  } = result.data;

  // Combine date + optional time into a DateTime for BookingRequest.requestedAt.
  // Time defaults to midnight if not provided; stored as UTC.
  const timePart = preferredTime ?? '00:00';
  const requestedAt = new Date(`${preferredDate}T${timePart}:00`);

  let inquiry;
  try {
    inquiry = await prisma.inquiry.create({
      data: {
        type: 'BOOKING_REQUEST',
        name,
        email,
        phone: phone ?? null,
        message: notes ?? null,
        payload: {
          packageName: packageName ?? null,
          modifierIds,
          estimatedTotalCents: estimatedTotalCents ?? null,
          preferredDate,
          preferredTime: preferredTime ?? null
        },
        bookingRequest: {
          create: {
            packageId: packageId ?? null,
            requestedAt: isNaN(requestedAt.getTime()) ? null : requestedAt,
            notes: notes ?? null,
            selectedOptions: { modifierIds }
          }
        }
      },
      include: { bookingRequest: true }
    });
  } catch (error) {
    console.error('[bookings] Failed to persist booking request', error);
    return jsonError({ code: 'INTERNAL', message: 'Failed to save booking request.' });
  }

  // ── Notification ──────────────────────────────────────────────────────────
  await sendBookingNotification({
    inquiryId: inquiry.id,
    name,
    email,
    phone: phone ?? null,
    packageName: packageName ?? null,
    preferredDate,
    preferredTime: preferredTime ?? null,
    notes: notes ?? null,
    modifierIds,
    estimatedTotalCents: estimatedTotalCents ?? null
  });

  return jsonOk({ inquiryId: inquiry.id });
};
