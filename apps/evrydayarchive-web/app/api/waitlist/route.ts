import { getServerEnv } from '../../lib/env';

export const POST = async (req: Request): Promise<Response> => {
  const { ADMIN_API_BASE_URL } = getServerEnv();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  let adminRes: Response;
  try {
    adminRes = await fetch(new URL('/api/public/waitlist', ADMIN_API_BASE_URL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('[waitlist] Failed to reach admin API', err);
    return Response.json({ error: 'Unable to submit. Please try again.' }, { status: 502 });
  }

  const data = await adminRes.json().catch(() => null);
  return Response.json(data, { status: adminRes.status });
};
