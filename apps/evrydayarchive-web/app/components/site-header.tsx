'use client';

import Image from './img';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../lib/cn';
import { MobileMenu } from './mobile-menu';
import { ThemeToggle } from './theme-toggle';
import { isSaleAnnouncementActive, SALE } from '../lib/sale';

const NAV = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/packages', label: 'Packages' }
] as const;

// Evaluated once at module load — same value on server and client during the sale window.
const saleActive = isSaleAnnouncementActive();

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
 * Mobile: fixed bottom bar — hamburger left, logo centre, Inquire right.
 *         A thin accent "APRIL SALE" strip sits immediately above it; tapping
 *         it reveals a details panel that slides up from the strip.
 *
 * Desktop: sticky top wrapper — logo | nav (+ "April Sale" toggle) | theme + Inquire.
 *          Clicking "April Sale" expands a full-width panel below the nav bar.
 */
export const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [mobileSaleOpen, setMobileSaleOpen] = useState(false);

  return (
    <>
      {/* ── Desktop: sticky wrapper (nav bar + collapsible sale panel) ────── */}
      <div className="hidden md:block md:sticky md:top-0 md:z-40">
        {/* Nav bar */}
        <div className="h-16 border-b border-border bg-canvas">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
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

            {/* Nav links + optional sale toggle */}
            <nav aria-label="Main navigation" className="flex items-center gap-8">
              {NAV.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} />
              ))}

              {saleActive && (
                <button
                  type="button"
                  onClick={() => setSaleOpen((o) => !o)}
                  aria-expanded={saleOpen}
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium text-accent',
                    'transition-opacity duration-fast hover:opacity-75',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm'
                  )}
                >
                  {SALE.name}
                  <ChevronDown
                    className={cn(
                      'transition-transform duration-fast',
                      saleOpen ? 'rotate-180' : 'rotate-0'
                    )}
                  />
                </button>
              )}
            </nav>

            {/* Right actions */}
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

        {/* Sale panel — slides open below the nav bar */}
        {saleActive && (
          <div
            className={cn(
              'overflow-hidden transition-[max-height] ease-in-out',
              saleOpen ? 'max-h-24 duration-standard' : 'max-h-0 duration-fast'
            )}
          >
            <div className="flex items-center justify-between gap-4 bg-accent px-4 py-3 sm:px-6 lg:px-8">
              <p className="flex items-center gap-3 text-sm text-white">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {SALE.name}
                </span>
                Book any session in May and get 10% off your shoot — no code needed.
              </p>
              <div className="flex flex-none items-center gap-3">
                <Link
                  href="/book"
                  onClick={() => setSaleOpen(false)}
                  className="rounded-card bg-white/20 px-3 py-1 text-xs font-medium text-white transition-colors duration-fast hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  Book now →
                </Link>
                <button
                  type="button"
                  onClick={() => setSaleOpen(false)}
                  aria-label="Close April Sale banner"
                  className="text-white/60 transition-colors duration-fast hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:rounded-sm"
                >
                  <XIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile: fixed bottom nav bar ─────────────────────────────────── */}
      <header
        className={cn(
          'fixed bottom-0 z-40 w-full h-16 border-t border-border bg-canvas will-change-transform',
          'md:hidden'
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
          {/*
           * Closed: [☰ left] .............. [logo centre] .............. [Inquire right]
           */}
          <div className="grid w-full grid-cols-3 items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-card text-ink-muted transition-colors hover:bg-sun focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {mobileMenuOpen ? <XIcon size={18} /> : <MenuIcon />}
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
        </div>
      </header>

      {/* ── Mobile: sale bar (persistent, sits above bottom nav) ─────────── */}
      {saleActive && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-accent md:hidden">
          {/* Expanded detail panel — reveals upward from the thin label bar */}
          <div
            className={cn(
              'overflow-hidden transition-[max-height] ease-in-out',
              mobileSaleOpen ? 'max-h-36 duration-standard' : 'max-h-0 duration-fast'
            )}
          >
            <div className="px-4 pb-3 pt-3">
              <p className="text-sm leading-relaxed text-white">
                Book any session in May and get 10% off your shoot — no code needed.
              </p>
              <Link
                href="/book"
                onClick={() => setMobileSaleOpen(false)}
                className="mt-2 inline-flex items-center text-xs font-medium text-white/80 underline underline-offset-2 transition-colors duration-fast hover:text-white"
              >
                Book now →
              </Link>
            </div>
          </div>

          {/* Thin label bar — always visible */}
          <button
            type="button"
            onClick={() => setMobileSaleOpen((o) => !o)}
            aria-expanded={mobileSaleOpen}
            aria-label={mobileSaleOpen ? 'Close April Sale details' : 'View April Sale details'}
            className="flex h-7 w-full items-center justify-center gap-1.5 text-white"
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
              {SALE.name}
            </span>
            {/* Chevron points up (▲) when collapsed to suggest expanding upward */}
            <ChevronDown
              className={cn(
                'transition-transform duration-fast',
                mobileSaleOpen ? 'rotate-0' : 'rotate-180'
              )}
            />
          </button>
        </div>
      )}

      <MobileMenu
        id="mobile-menu"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={NAV}
        bottomOffset={saleActive ? 'bottom-[92px]' : 'bottom-16'}
      />
    </>
  );
};

// ── Icons ─────────────────────────────────────────────────────────────────────

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

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M2 4l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
