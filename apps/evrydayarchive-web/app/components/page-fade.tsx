'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Wraps page content and re-fires animate-fade-in on every navigation by
 * keying the container to the current pathname. React unmounts and remounts
 * the subtree on route change, which resets the CSS animation.
 */
export const PageFade = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
};
