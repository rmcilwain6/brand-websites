import { type NextRequest, NextResponse } from 'next/server';

const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === 'true';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // When coming-soon mode is off, redirect the coming-soon page to home
  if (!COMING_SOON) {
    if (pathname === '/coming-soon') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Pass through the coming-soon page, API routes, private gallery links, and any static file
  if (
    pathname === '/coming-soon' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/private/') ||
    /\.\w+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/coming-soon', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)']
};
