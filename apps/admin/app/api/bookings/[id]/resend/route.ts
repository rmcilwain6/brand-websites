import { createApiError, jsonError, jsonOk } from '@repo/core';
import { prisma } from '@repo/db';

import { requireAdminSession } from '../../../../lib/auth';
import { sendBookingConfirmation, sendBookingNotification } from '../../../../lib/email';
import { buildModifierLineItems } from '../../../../lib/modifiers';

type BookingPayload = {
  location?: string;
  packageName?: string | null;
  modifierIds?: string[];
  modifierValues?: Record<string, number> | null;
  estimatedTotalCents?: number | null;
  preferredDate?: string;
  preferredTime?: string | null;
};

type SelectedOptions = {
  modifierIds?: string[];
  modifierValues?: Record<string, number>;
};

export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: params.id },
    include: {
      inquiry: true,
      package: { include: { modifiers: { orderBy: { sortOrder: 'asc' } } } }
    }
  });

  if (!booking || !booking.inquiry) {
    return jsonError(createApiError('NOT_FOUND', 'Booking not found.'), 404);
  }

  const { inquiry } = booking;
  const payload = inquiry.payload as BookingPayload | null;
  const selectedOptions = booking.selectedOptions as SelectedOptions | null;

  const modifierLineItems =
    booking.package && selectedOptions
      ? buildModifierLineItems(
          booking.package.modifiers,
          selectedOptions.modifierIds ?? [],
          selectedOptions.modifierValues ?? {}
        )
      : undefined;

  const emailData = {
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone ?? undefined,
    location: payload?.location ?? '',
    preferredDate: payload?.preferredDate ?? booking.requestedAt?.toISOString().slice(0, 10) ?? '',
    preferredTime: payload?.preferredTime ?? undefined,
    packageName: payload?.packageName ?? undefined,
    estimatedTotalCents: payload?.estimatedTotalCents ?? undefined,
    notes: inquiry.message ?? undefined,
    inquiryId: inquiry.id,
    modifierLineItems
  };

  try {
    await Promise.all([sendBookingConfirmation(emailData), sendBookingNotification(emailData)]);
    await prisma.bookingRequest.update({
      where: { id: params.id },
      data: { emailSentAt: new Date(), emailError: null }
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await prisma.bookingRequest
      .update({ where: { id: params.id }, data: { emailError: errorMsg } })
      .catch(() => {});
    return jsonError(createApiError('INTERNAL', `Email send failed: ${errorMsg}`));
  }

  return jsonOk({ resent: true });
};
