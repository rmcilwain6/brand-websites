import { createApiError, jsonError, jsonOk } from '@repo/core';
import { prisma } from '@repo/db';

import { requireAdminSession } from '../../../../lib/auth';
import { loadBookingEmailData } from '../../../../lib/booking-email-data';
import { sendBookingConfirmation, sendBookingNotification } from '../../../../lib/email';

export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  // Rebuilt from the saved booking, including its referral fields and the current state of any
  // voucher code it entered.
  const emailData = await loadBookingEmailData(params.id, new URL(req.url).origin);

  if (!emailData) {
    return jsonError(createApiError('NOT_FOUND', 'Booking not found.'), 404);
  }

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
