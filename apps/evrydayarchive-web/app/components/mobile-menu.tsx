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
 * Opens via clip-path reveal from bottom → top (like a print being uncovered).
 * Nav items have archival catalog numbers (01, 02…) in mono to the left.
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
        'fixed inset-x-0 top-0 bottom-16 z-30 flex flex-col bg-canvas md:hidden',
        // clip-path reveal: inset(100% 0 0 0) = fully clipped from top edge down,
        // visible area is a 0-height strip at the bottom. Animating top inset to 0%
        // uncovers the content upward — like a print sliding out of its sleeve.
        'transition-[clip-path,opacity] duration-standard',
        isOpen
          ? '[clip-path:inset(0%_0_0_0)] opacity-100 pointer-events-auto'
          : '[clip-path:inset(100%_0_0_0)] opacity-0 pointer-events-none'
      )}
    >
      {/* Logo — centered at the top */}
      <div className="flex justify-center pt-10">
        <Link href="/" onClick={onClose} aria-label="Evryday Archive Co — home">
          <Image
            src="/logo/stacked.svg"
            alt="Evryday Archive Co"
            width={100}
            height={76}
            priority
            className="dark:hidden"
          />
          <Image
            src="/logo/stacked-dark.svg"
            alt="Evryday Archive Co"
            width={100}
            height={76}
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
        {allLinks.map((link, i) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : pathname === link.href || pathname.startsWith(link.href);
          const catalogNum = String(i + 1).padStart(2, '0');
          // Stagger: use animate-fade-up (keyframe, fill-mode:both) so items
          // always start from opacity:0 — eliminates the first-render flash
          // that transition-based approaches can produce after navigation.
          const staggerDelay = `${80 + i * 70}ms`;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              style={isOpen ? { animationDelay: staggerDelay } : undefined}
              className={cn(
                'flex items-baseline gap-3 transition-opacity duration-fast hover:opacity-70',
                isOpen ? 'animate-fade-up' : 'opacity-0'
              )}
            >
              {/* Catalog number — archival detail, visually subordinate */}
              <span className="font-mono text-[10px] font-medium tracking-widest text-ink-faint">
                {catalogNum}
              </span>
              {/* Label — underline on active */}
              <span
                className={cn(
                  'relative text-3xl font-medium text-ink',
                  'after:absolute after:left-0 after:-bottom-[6px] after:h-[2px] after:w-full after:bg-accent after:transition-transform after:duration-fast',
                  isActive ? 'after:scale-x-100' : 'after:scale-x-0'
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
