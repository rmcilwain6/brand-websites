import { BookingFormSchema, jsonError, jsonOk, parseJson } from '@repo/core';
import { prisma } from '@repo/db';

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
  // TODO: Wire up an email provider (e.g. Resend, Postmark) when selected.
  //
  // Send to: your notification email address
  // Subject: `New booking request — ${packageName ?? 'no package'} — ${name}`
  // Body should include:
  //   - name, email, phone
  //   - packageName, modifierIds, estimatedTotalCents
  //   - preferredDate, preferredTime
  //   - notes
  //   - admin link: /inquiries/${inquiry.id} (once that page exists)
  //
  console.info('[bookings] New booking request — follow up required', {
    inquiryId: inquiry.id,
    name,
    email,
    phone: phone ?? null,
    packageName: packageName ?? null,
    preferredDate,
    preferredTime: preferredTime ?? null,
    modifierIds,
    estimatedTotalCents: estimatedTotalCents ?? null,
    notes: notes ?? null
  });

  return jsonOk({ inquiryId: inquiry.id });
};
