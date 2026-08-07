import { NextResponse } from 'next/server';

import { getServerEnv } from '../../../lib/env';

export const POST = async (
  req: Request,
  { params }: { params: { token: string } }
): Promise<Response> => {
  const { ADMIN_API_BASE_URL } = getServerEnv();

  const formData = await req.formData();
  const password = formData.get('password');

  const failureUrl = new URL(`/private/${params.token}`, req.url);
  failureUrl.searchParams.set('error', '1');

  if (typeof password !== 'string' || !password) {
    return NextResponse.redirect(failureUrl, { status: 303 });
  }

  let adminRes: Response;
  try {
    adminRes = await fetch(
      new URL(
        `/api/public/private-galleries/${encodeURIComponent(params.token)}/verify`,
        ADMIN_API_BASE_URL
      ),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      }
    );
  } catch (err) {
    console.error('[private-galleries] Failed to reach admin API', err);
    return NextResponse.redirect(failureUrl, { status: 303 });
  }

  const payload = await adminRes.json().catch(() => null);

  if (!adminRes.ok || !payload?.ok) {
    return NextResponse.redirect(failureUrl, { status: 303 });
  }

  const successUrl = new URL(`/private/${params.token}`, req.url);
  const response = NextResponse.redirect(successUrl, { status: 303 });

  response.cookies.set({
    name: `private_access_${params.token}`,
    value: payload.data.token,
    httpOnly: true,
    sameSite: 'lax',
    path: `/private/${params.token}`
  });

  return response;
};
