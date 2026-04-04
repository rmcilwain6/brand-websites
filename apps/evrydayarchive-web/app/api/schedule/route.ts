import { PublicApiError, fetchPublicSchedule } from '@repo/core';

import { getServerEnv } from '../../lib/env';

export const GET = async (req: Request): Promise<Response> => {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  const { ADMIN_API_BASE_URL } = getServerEnv();

  try {
    const windows = await fetchPublicSchedule(ADMIN_API_BASE_URL, { from, to });
    return Response.json(windows);
  } catch (error) {
    if (error instanceof PublicApiError) {
      return Response.json({ message: error.message }, { status: error.status });
    }
    return Response.json({ message: 'Unable to fetch schedule.' }, { status: 500 });
  }
};
