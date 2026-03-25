'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../lib/cn';
import { ThemeToggle } from './theme-toggle';

type NavLink = { href: string; label: string };

type MobileMenuProps = {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  links: readonly NavLink[];
};

/**
 * Full-screen mobile navigation overlay.
 * Nav items are centered both vertically and horizontally.
 * Active link is indicated by an orange underline.
 */
export const MobileMenu = ({ id, isOpen, onClose, links }: MobileMenuProps) => {
  const pathname = usePathname();
  const allLinks: NavLink[] = [{ href: '/', label: 'Home' }, ...links];

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      aria-hidden={!isOpen}
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-canvas md:hidden',
        'transition-opacity duration-standard',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Close button — top-right corner */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation menu"
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-card text-ink-muted transition-colors hover:bg-sun focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <XIcon />
      </button>

      {/* Centered nav links */}
      <nav
        className="flex flex-1 flex-col items-center justify-center gap-10"
        aria-label="Mobile navigation"
      >
        {allLinks.map((link) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : pathname === link.href || pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'relative text-3xl font-medium text-ink transition-opacity duration-fast hover:opacity-70',
                // Orange underline sits 6px below the text baseline
                'after:absolute after:left-0 after:-bottom-[6px] after:h-[2px] after:w-full after:bg-accent after:transition-transform after:duration-fast',
                isActive ? 'after:scale-x-100' : 'after:scale-x-0'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex items-center gap-3 px-6 pb-10 pt-6">
        <Link
          href="/inquire"
          onClick={onClose}
          className="flex-1 rounded-card bg-accent py-4 text-center text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90"
        >
          Inquire
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
};

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
