'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { cn } from '../lib/cn';
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
 *  - Expanded (default / scroll-up): hamburger | horizontal lockup | Inquire CTA
 *  - Collapsed (scroll-down past threshold): slim bar — icon mark only.
 *    Tapping the icon navigates home; tapping anywhere else expands the header.
 *
 * On desktop:
 *  - Always expanded: horizontal lockup | nav links | theme toggle | Inquire CTA
 */
// How many px of continuous scroll in one direction before toggling state.
// This prevents jitter from inertial scroll micro-oscillations on mobile.
const COLLAPSE_THRESHOLD = 48;
const EXPAND_THRESHOLD = 24;
// Only engage the scroll behaviour below this breakpoint (768px = Tailwind `md`).
const MOBILE_BREAKPOINT = 768;

export const SiteHeader = () => {
  const [scrolledDown, setScrolledDown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastY = useRef(0);
  const directionBuffer = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      // Disable the collapse behaviour entirely on desktop.
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        if (scrolledDown) setScrolledDown(false);
        lastY.current = window.scrollY;
        directionBuffer.current = 0;
        return;
      }

      const y = window.scrollY;
      const delta = y - lastY.current;
      lastY.current = y;

      // Near the top: always show the full header and clear the buffer.
      if (y < 80) {
        directionBuffer.current = 0;
        setScrolledDown(false);
        return;
      }

      // If direction reversed, reset the buffer so a tiny bounce can't trigger.
      if (
        (delta > 0 && directionBuffer.current < 0) ||
        (delta < 0 && directionBuffer.current > 0)
      ) {
        directionBuffer.current = 0;
      }
      directionBuffer.current += delta;

      if (directionBuffer.current > COLLAPSE_THRESHOLD) {
        directionBuffer.current = 0;
        setScrolledDown(true);
      } else if (directionBuffer.current < -EXPAND_THRESHOLD) {
        directionBuffer.current = 0;
        setScrolledDown(false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrolledDown]);

  // Close mobile menu when header collapses
  useEffect(() => {
    if (scrolledDown) setMobileMenuOpen(false);
  }, [scrolledDown]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 border-b border-border bg-canvas overflow-hidden',
          'transition-[height] duration-standard',
          // Desktop: always full height — collapse is mobile-only.
          'md:h-16',
          // Mobile: shrink to slim bar when scrolling down.
          scrolledDown ? 'h-11' : 'h-16'
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ── Mobile layout ─────────────────────────────────────── */}
          {/*
           * All three elements stay in the DOM at all times so CSS transitions
           * can drive every part of the animation simultaneously:
           *  - Hamburger + Inquire fade out (opacity → 0, pointer-events-none)
           *  - Logo slides left (left-1/2 → left-0) and shrinks (scale-100 → scale-85)
           *    with origin-left so the shrink reinforces the leftward motion
           *  - Inside the logo, horizontal lockup and icon mark crossfade
           */}
          <div className="relative flex w-full items-center justify-between md:hidden">
            {/* Full-width expand button — sits behind everything, only useful when collapsed */}
            {scrolledDown && (
              <button
                type="button"
                onClick={() => setScrolledDown(false)}
                className="absolute inset-0 z-0"
                aria-label="Expand navigation"
              />
            )}

            {/* Hamburger — fades out on collapse */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-card text-ink-muted transition-all duration-standard hover:bg-sun focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
                scrolledDown ? 'pointer-events-none opacity-0' : 'opacity-100'
              )}
            >
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>

            {/* Logo — slides left and shrinks on collapse, crossfades horizontal ↔ icon */}
            <Link
              href="/"
              aria-label="Evryday Archive Co — home"
              className={cn(
                'absolute z-10 origin-left transition-all duration-standard',
                scrolledDown
                  ? 'left-0 scale-[0.85] translate-x-0'
                  : 'left-1/2 scale-100 -translate-x-1/2'
              )}
            >
              <div className="relative h-[52px] w-[124px]">
                {/* Horizontal lockup — shown when expanded */}
                <Image
                  src="/logo/horizontal.svg"
                  alt="Evryday Archive Co"
                  width={124}
                  height={52}
                  priority
                  className={cn(
                    'absolute inset-0 dark:hidden transition-opacity duration-standard',
                    scrolledDown ? 'opacity-0' : 'opacity-100'
                  )}
                />
                <Image
                  src="/logo/horizontal-dark.svg"
                  alt="Evryday Archive Co"
                  width={124}
                  height={52}
                  priority
                  className={cn(
                    'absolute inset-0 hidden dark:block transition-opacity duration-standard',
                    scrolledDown ? 'opacity-0' : 'opacity-100'
                  )}
                />
                {/* Icon mark — shown when collapsed */}
                <Image
                  src="/logo/icon.svg"
                  alt="Evryday Archive Co"
                  width={68}
                  height={39}
                  priority
                  className={cn(
                    'absolute top-1/2 left-0 -translate-y-1/2 dark:hidden transition-opacity duration-standard',
                    scrolledDown ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <Image
                  src="/logo/icon-dark.svg"
                  alt="Evryday Archive Co"
                  width={68}
                  height={39}
                  priority
                  className={cn(
                    'absolute top-1/2 left-0 -translate-y-1/2 hidden dark:block transition-opacity duration-standard',
                    scrolledDown ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </div>
            </Link>

            {/* Inquire — fades out on collapse */}
            <Link
              href="/inquire"
              className={cn(
                'rounded-card bg-accent px-3 py-1.5 text-xs font-medium text-white transition-all duration-standard hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
                scrolledDown ? 'pointer-events-none opacity-0' : 'opacity-100'
              )}
            >
              Inquire
            </Link>
          </div>

          {/* ── Desktop layout ─────────────────────────────────────── */}
          <div className="hidden w-full items-center justify-between md:flex">
            <Link
              href="/"
              aria-label="Evryday Archive Co — home"
              className="transition-opacity duration-fast hover:opacity-70"
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
