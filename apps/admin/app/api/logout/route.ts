import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getSessionCookieName } from '../../lib/auth';

export const POST = (req: Request): Response => {
  cookies().delete(getSessionCookieName());
  return NextResponse.redirect(new URL('/login', req.url));
};
