'use client';

import type { ReactNode } from 'react';

/** Scrolls to a section on this page: smoothly, or straight there under reduced motion. */
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
      const target = document.getElementById(to);
      if (!target) return;
      // Handled here so the hash doesn't join the answers in the URL.
      e.preventDefault();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    }}
  >
    {children}
  </a>
);
