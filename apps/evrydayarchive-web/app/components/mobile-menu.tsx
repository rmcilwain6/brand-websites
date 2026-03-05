'use client';

import Link from 'next/link';

type NavLink = { href: string; label: string };

type MobileMenuProps = {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  links: readonly NavLink[];
};

/**
 * Full-screen mobile navigation overlay.
 * Animates in/out via opacity + pointer-events; no layout shift.
 */
export const MobileMenu = ({ id, isOpen, onClose, links }: MobileMenuProps) => {
  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      aria-hidden={!isOpen}
      className={[
        'fixed inset-0 z-30 flex flex-col bg-canvas md:hidden',
        'transition-opacity duration-standard',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      ].join(' ')}
    >
      {/* Spacer — accounts for the sticky header height */}
      <div className="h-16 flex-none" />

      <nav className="flex flex-col px-6 pt-8" aria-label="Mobile navigation">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="border-b border-border py-5 text-2xl font-medium text-ink transition-colors duration-fast hover:text-accent"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="px-6 pt-10">
        <Link
          href="/inquire"
          onClick={onClose}
          className="block w-full rounded-card bg-accent py-4 text-center text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90"
        >
          Inquire
        </Link>
      </div>
    </div>
  );
};
