'use client';

import { usePathname } from 'next/navigation';

import { SiteFooter } from './site-footer';

const NO_FOOTER_ROUTES = ['/spring-sale'];

export function ConditionalFooter() {
  const pathname = usePathname();
  if (NO_FOOTER_ROUTES.includes(pathname)) return null;
  return <SiteFooter />;
}
