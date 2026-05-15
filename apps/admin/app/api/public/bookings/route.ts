import { BookingFormSchema, jsonError, jsonOk, parseJson } from '@repo/core';
import { prisma } from '@repo/db';

import { sendBookingConfirmation, sendBookingNotification } from '../../../lib/email';
import { buildModifierLineItems } from '../../../lib/modifiers';
import type { ModifierLineItem } from '../../../lib/email';

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
    location,
    preferredDate,
    preferredTime,
    notes,
    packageId,
    packageName,
    modifierIds,
    modifierValues,
    springSale,
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
            selectedOptions: { modifierIds, modifierValues: modifierValues ?? {} }
          }
        }
      },
      include: { bookingRequest: true }
    });
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
          basePriceCents: true,
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
      modifierLineItems = buildModifierLineItems(
        pkgRecord.modifiers,
        modifierIds ?? [],
        modifierValues ?? {}
      );

      if (springSale && estimatedTotalCents != null) {
        const preSaleTotal =
          (pkgRecord.basePriceCents ?? 0) +
          modifierLineItems.reduce((sum, item) => sum + (item.priceDeltaCents ?? 0), 0);
        const discountCents = preSaleTotal - estimatedTotalCents;
        if (discountCents > 0) {
          modifierLineItems.push({
            name: 'Spring Sale (10% off)',
            priceDeltaCents: -discountCents
          });
        }
      }
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
