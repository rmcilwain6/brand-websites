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

// Archival reference codes — one per route, shown on the active link
// as a rubber-stamp detail instead of a colour/style change.
const ARCHIVE_CODES: Record<string, string> = {
  '/portfolio': 'FILE/041',
  '/packages': 'PKG/007',
  '/process': 'SEQ/003',
  '/contact': 'REF/099'
};

const ArchiveStamp = ({ code }: { code: string }) => (
  <span
    aria-hidden
    className="flex-shrink-0 rotate-[-3deg] border border-accent/55 px-2 py-[3px] font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-accent/70"
  >
    {code}
  </span>
);

/**
 * Mobile navigation drawer.
 * Expands downward from the header with a scaleY + opacity transition.
 * Overlays the page content rather than pushing it.
 */
export const MobileMenu = ({ id, isOpen, onClose, links }: MobileMenuProps) => {
  const pathname = usePathname();

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      aria-hidden={!isOpen}
      className={cn(
        'fixed inset-x-0 top-16 z-30 flex flex-col bg-canvas md:hidden',
        'border-b border-border shadow-warm-lg',
        // Expand downward: scale from origin-top + fade in
        'origin-top transition-all duration-standard',
        isOpen
          ? 'scale-y-100 opacity-100 pointer-events-auto'
          : 'scale-y-95 opacity-0 pointer-events-none'
      )}
    >
      <nav className="flex flex-col px-6 pt-6" aria-label="Mobile navigation">
        {links.map((link) => {
          const isActive =
            pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center justify-between border-b border-border py-5 text-2xl font-medium text-ink transition-opacity duration-fast hover:opacity-70"
            >
              {link.label}
              {isActive && <ArchiveStamp code={ARCHIVE_CODES[link.href] ?? 'ARCH/000'} />}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 px-6 pb-8 pt-6">
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
