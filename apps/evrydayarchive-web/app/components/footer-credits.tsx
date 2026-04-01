'use client';

import { useEffect, useRef, useState } from 'react';

type Credit = {
  name: string;
  kind: string;
  creator: string;
  source: string;
  href: string;
};

const CREDITS: Credit[] = [
  {
    name: 'Entrance',
    kind: 'icon',
    creator: 'Zach Bogart',
    source: 'Noun Project',
    href: 'https://thenounproject.com/browse/icons/term/entrance/'
  }
];

export const FooterCredits = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs text-ink-faint transition-colors duration-fast hover:text-ink"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        Credits
        {open ? (
          /* Close icon */
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden
            className="shrink-0"
          >
            <circle cx="6.5" cy="6.5" r="5.75" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M4.5 4.5l4 4M8.5 4.5l-4 4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          /* Info icon */
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden
            className="shrink-0"
          >
            <circle cx="6.5" cy="6.5" r="5.75" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6.5 5.5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="6.5" cy="3.5" r="0.75" fill="currentColor" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute bottom-full right-0 mb-2.5 w-64 rounded-card border border-border bg-surface shadow-warm"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-ink-faint">
              Creative credits
            </p>
          </div>
          <ul className="divide-y divide-border">
            {CREDITS.map((credit) => (
              <li key={credit.name} className="px-4 py-2.5">
                <p className="text-xs text-ink-faint">
                  &ldquo;{credit.name}&rdquo; {credit.kind} by {credit.creator} from{' '}
                  <a
                    href={credit.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-muted underline-offset-2 hover:underline"
                  >
                    {credit.source}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
