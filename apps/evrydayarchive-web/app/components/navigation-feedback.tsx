'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type NavState = 'idle' | 'loading' | 'complete';

/**
 * Two-part navigation feedback:
 *
 * Mobile (< md): a 2px accent-coloured progress bar pinned to the top edge of
 * the fixed bottom nav. Fills to ~75% while loading (indeterminate feel), then
 * snaps to 100% and fades out when the new page lands.
 *
 * Desktop (md+): a small indicator that follows the cursor and disappears
 * the instant the new page lands.
 *
 * Navigation start is detected by listening for clicks on internal <a> tags.
 * Navigation end is detected by a change in usePathname().
 */
export const NavigationFeedback = () => {
  const pathname = usePathname();
  const [navState, setNavState] = useState<NavState>('idle');
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [barWidth, setBarWidth] = useState('0%');
  const [barOpacity, setBarOpacity] = useState(1);
  const prevPathname = useRef(pathname);

  // Detect click on internal links → start loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      )
        return;
      if (href === pathname) return;

      setCursorPos({ x: e.clientX, y: e.clientY });
      setNavState('loading');
      setBarOpacity(1);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  // Track cursor continuously while loading so the indicator follows the mouse
  useEffect(() => {
    if (navState !== 'loading') return;
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [navState]);

  // Trigger the bar's CSS transition after it mounts at 0%
  useEffect(() => {
    if (navState !== 'loading') return;
    setBarWidth('0%');
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setBarWidth('75%'));
    });
    return () => cancelAnimationFrame(raf);
  }, [navState]);

  // Pathname changed → navigation complete
  useEffect(() => {
    if (navState === 'loading' && pathname !== prevPathname.current) {
      // Cursor indicator disappears immediately
      setNavState('complete');
      // Progress bar snaps to 100% then fades
      setBarWidth('100%');
      const t1 = setTimeout(() => setBarOpacity(0), 200);
      const t2 = setTimeout(() => {
        setNavState('idle');
        setBarWidth('0%');
        setBarOpacity(1);
      }, 550);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    prevPathname.current = pathname;
  }, [pathname, navState]);

  if (navState === 'idle') return null;

  return (
    <>
      {/* Mobile: progress bar at top edge of bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 z-50 h-[2px] md:hidden">
        <div
          className="h-full bg-accent"
          style={{
            width: barWidth,
            opacity: barOpacity,
            transition:
              navState === 'complete'
                ? 'width 150ms ease-in, opacity 300ms ease-out 200ms'
                : 'width 2500ms cubic-bezier(0.05, 0.6, 0.2, 1)'
          }}
        />
      </div>

      {/* Desktop: cursor-following indicator, visible only while loading */}
      {navState === 'loading' && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 hidden md:block"
          style={{ left: cursorPos.x + 14, top: cursorPos.y + 14 }}
        >
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}
    </>
  );
};
