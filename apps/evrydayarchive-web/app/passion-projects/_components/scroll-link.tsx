'use client';

import type { ReactNode } from 'react';

/** Scrolls to a section on this page: smoothly, or straight there under reduced motion. */
export const scrollToSection = (id: string) => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
};

/** A link to a section on this page. */
export const ScrollLink = ({
  to,
  className,
  children
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) => (
  <a
    href={`#${to}`}
    className={className}
    onClick={(e) => {
      if (!document.getElementById(to)) return;
      // Handled here so the hash doesn't join the answers in the URL.
      e.preventDefault();
      scrollToSection(to);
    }}
  >
    {children}
  </a>
);
