'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../lib/cn';

type NavLink = { href: string; label: string };

type MobileMenuProps = {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  links: readonly NavLink[];
};

/**
 * Full-screen mobile navigation overlay.
 *
 * Sits at z-30, below the bottom bar (z-40), so the bar always remains
 * visible on top. The overlay stops at bottom-16 to leave the bar exposed.
 *
 * Layout: logo centered at top → nav links centered in remaining space.
 * Active link: orange underline (matches desktop NavLink).
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
        // Stop at bottom-16 so the fixed bottom bar (h-16) stays visible on top.
        'fixed inset-x-0 top-0 bottom-16 z-30 flex flex-col bg-canvas md:hidden',
        'transition-opacity duration-standard',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Logo — centered at the top */}
      <div className="flex justify-center pt-10">
        <Link href="/" onClick={onClose} aria-label="Evryday Archive Co — home">
          <Image
            src="/logo/horizontal.svg"
            alt="Evryday Archive Co"
            width={120}
            height={50}
            priority
            className="dark:hidden"
          />
          <Image
            src="/logo/horizontal-dark.svg"
            alt="Evryday Archive Co"
            width={120}
            height={50}
            priority
            className="hidden dark:block"
          />
        </Link>
      </div>

      {/* Nav links — centered in remaining space */}
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
                'after:absolute after:left-0 after:-bottom-[6px] after:h-[2px] after:w-full after:bg-accent after:transition-transform after:duration-fast',
                isActive ? 'after:scale-x-100' : 'after:scale-x-0'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
