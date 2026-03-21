import { type NextRequest, NextResponse } from 'next/server';

const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === 'true';

export function middleware(request: NextRequest) {
  if (!COMING_SOON) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Pass through the coming-soon page, API routes, and any static file (has a file extension)
  if (pathname === '/coming-soon' || pathname.startsWith('/api/') || /\.\w+$/.test(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/coming-soon', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)']
};
