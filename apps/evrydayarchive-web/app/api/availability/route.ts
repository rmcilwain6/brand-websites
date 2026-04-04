import { createApiError, jsonError, jsonOk } from '@repo/core';

import { getServerEnv } from '../../lib/env';

export const GET = async (req: Request): Promise<Response> => {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const { ADMIN_API_BASE_URL } = getServerEnv();

  const url = new URL('/api/public/availability', ADMIN_API_BASE_URL);
  if (from) url.searchParams.set('from', from);
  if (to) url.searchParams.set('to', to);

  let adminRes: Response;
  try {
    adminRes = await fetch(url);
  } catch (error) {
    console.error('[availability] Failed to reach admin API', error);
    return jsonError(createApiError('INTERNAL', 'Unable to fetch availability.'));
  }

  if (!adminRes.ok) {
    return jsonError(createApiError('INTERNAL', 'Availability fetch failed.'), adminRes.status);
  }

  const data = await adminRes.json();
  return jsonOk(data);
};
