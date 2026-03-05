'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { cn } from '../lib/cn';
import { Logo } from './logo';
import { MobileMenu } from './mobile-menu';
import { ThemeToggle } from './theme-toggle';

const NAV = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/packages', label: 'Packages' },
  { href: '/process', label: 'Process' },
  { href: '/contact', label: 'Contact' }
] as const;

/**
 * SiteHeader — sticky navigation bar.
 *
 * On mobile:
 *  - Expanded (default / scroll-up): hamburger | logo mark | Inquire CTA
 *  - Collapsed (scroll-down past threshold): slim bar with logo mark only
 *
 * On desktop:
 *  - Always expanded: logo | nav links | theme toggle | Inquire CTA
 */
export const SiteHeader = () => {
  const [scrolledDown, setScrolledDown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Collapse only after scrolling past 80px and while moving downward
      if (y < 10) {
        setScrolledDown(false);
      } else {
        setScrolledDown(y > lastY.current);
      }
      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when header collapses
  useEffect(() => {
    if (scrolledDown) setMobileMenuOpen(false);
  }, [scrolledDown]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 border-b border-border bg-canvas overflow-hidden',
          'transition-all duration-standard'
        )}
        style={{ height: scrolledDown ? '44px' : '64px' }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ── Mobile layout ─────────────────────────────────────── */}
          <div className="flex w-full items-center justify-between md:hidden">
            {scrolledDown ? (
              // Slim collapsed state — logo mark only
              <Logo variant="mark" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                  className="flex h-9 w-9 items-center justify-center rounded-card text-ink-muted transition-colors duration-fast hover:bg-sun focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
                </button>

                <Logo variant="mark" />

                <Link
                  href="/inquire"
                  className="rounded-card bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Inquire
                </Link>
              </>
            )}
          </div>

          {/* ── Desktop layout ─────────────────────────────────────── */}
          <div className="hidden w-full items-center justify-between md:flex">
            <Logo />

            <nav aria-label="Main navigation" className="flex items-center gap-8">
              {NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink-muted transition-colors duration-fast hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
                >
                  {link.label}
                </Link>
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
