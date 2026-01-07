import { NextResponse } from 'next/server';

import {
  createAdminSessionToken,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
  verifyAdminPassword
} from '../../lib/auth';

export const POST = async (req: Request): Promise<Response> => {
  const formData = await req.formData();
  const password = formData.get('password');

  if (!verifyAdminPassword(typeof password === 'string' ? password : null)) {
    const url = new URL('/login', req.url);
    url.searchParams.set('error', '1');
    return NextResponse.redirect(url);
  }

  const response = NextResponse.redirect(new URL('/galleries', req.url));
  response.cookies.set({
    name: getSessionCookieName(),
    value: createAdminSessionToken(),
    httpOnly: true,
    sameSite: 'lax',
    maxAge: getSessionMaxAgeSeconds(),
    path: '/'
  });

  return response;
};
