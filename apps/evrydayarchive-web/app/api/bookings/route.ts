import { BookingFormSchema, createApiError, jsonError, jsonOk, parseJson } from '@repo/core';

import { getServerEnv, isPassionProjectsEnabled } from '../../lib/env';

export const POST = async (req: Request): Promise<Response> => {
  const result = await parseJson(req, BookingFormSchema);

  if (!result.ok) {
    return jsonError(result.error);
  }

  const { ADMIN_API_BASE_URL } = getServerEnv();

  // With the campaign off, a tab left open from before still books a regular session.
  const { applyToCampaign, campaignAnswers, ...regularBooking } = result.data;
  const booking = isPassionProjectsEnabled()
    ? { ...regularBooking, applyToCampaign, campaignAnswers }
    : regularBooking;

  let adminRes: Response;
  try {
    adminRes = await fetch(new URL('/api/public/bookings', ADMIN_API_BASE_URL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
  } catch (error) {
    console.error('[bookings] Failed to reach admin API', error);
    return jsonError(
      createApiError('INTERNAL', 'Unable to submit your request. Please try again.')
    );
  }

  if (!adminRes.ok) {
    const body = await adminRes.json().catch(() => null);
    const error =
      body?.error ?? createApiError('INTERNAL', 'Booking submission failed. Please try again.');
    return jsonError(error, adminRes.status);
  }

  return jsonOk({ received: true });
};
