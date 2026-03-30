'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../lib/cn';
import { MobileMenu } from './mobile-menu';
import { ThemeToggle } from './theme-toggle';

const NAV = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/packages', label: 'Packages' }
] as const;

/**
 * Desktop nav link — orange underline animates left→right on hover/active.
 */
const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        'relative text-sm text-ink-muted',
        'after:absolute after:left-0 after:-bottom-[6px] after:h-[2px] after:w-full',
        'after:bg-accent after:origin-left after:transition-transform after:duration-fast',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm',
        isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
      )}
    >
      {label}
    </Link>
  );
};

/**
 * "EST. 2025" rubber-stamp detail — floats to the right of the logo.
 * Desktop only.
 */
const EstStamp = () => {
  const isHome = usePathname() === '/';
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 rotate-[-7deg] transition-opacity duration-fast',
        isHome ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )}
    >
      <span className="block whitespace-nowrap border border-accent/55 px-1.5 py-[3px] font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-accent/70">
        EST. 2025
      </span>
    </span>
  );
};

/**
 * SiteHeader
 *
 * Mobile: fixed bottom bar — hamburger left, Inquire right.
 *         Always visible, no collapse. Logo lives in the page hero instead.
 *
 * Desktop: sticky top bar — logo | nav links | theme toggle | Inquire CTA.
 */
export const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          // Mobile: fixed bottom bar, always h-16, no collapse.
          'fixed bottom-0 z-40 w-full h-16 border-t border-border bg-canvas',
          // Desktop: sticky top bar.
          'md:sticky md:top-0 md:bottom-auto md:h-16 md:border-t-0 md:border-b md:overflow-hidden'
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ── Mobile layout ───────────────────────────────────────
           * Closed: [☰ left] ........................ [Inquire right]
           * Open:   [✕ left] [Inquire — fills remaining width      ]
           * Transition: padding + flex-grow animate via transition-all.
           */}
          <div className="grid w-full grid-cols-3 items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-card text-ink-muted transition-colors hover:bg-sun focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>

            <div className="flex justify-center">
              <Link
                href="/"
                aria-label="Evryday Archive Co — home"
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
              >
                <Image
                  src="/logo/horizontal.svg"
                  alt="Evryday Archive Co"
                  width={120}
                  height={51}
                  priority
                  className="dark:hidden"
                />
                <Image
                  src="/logo/horizontal-dark.svg"
                  alt="Evryday Archive Co"
                  width={120}
                  height={51}
                  priority
                  className="hidden dark:block"
                />
              </Link>
            </div>

            <div className="flex justify-end">
              <Link
                href="/inquire"
                className="rounded-card bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                Inquire
              </Link>
            </div>
          </div>

          {/* ── Desktop layout ─────────────────────────────────────── */}
          <div className="hidden w-full items-center justify-between md:flex">
            <div className="group relative">
              <Link
                href="/"
                aria-label="Evryday Archive Co — home"
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
              >
                <Image
                  src="/logo/horizontal.svg"
                  alt="Evryday Archive Co"
                  width={140}
                  height={59}
                  priority
                  className="dark:hidden"
                />
                <Image
                  src="/logo/horizontal-dark.svg"
                  alt="Evryday Archive Co"
                  width={140}
                  height={59}
                  priority
                  className="hidden dark:block"
                />
              </Link>
              <EstStamp />
            </div>

            <nav aria-label="Main navigation" className="flex items-center gap-8">
              {NAV.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} />
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/inquire"
                className="rounded-card bg-accent px-4 py-1.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                Inquire
              </Link>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        id="mobile-menu"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={NAV}
      />
    </>
  );
};

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M2 5h14M2 9h14M2 13h14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
