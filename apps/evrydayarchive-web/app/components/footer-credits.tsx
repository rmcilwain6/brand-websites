'use client';

import { useState } from 'react';

type Credit = {
  label: string;
  name: string;
  author: string;
  href?: string;
};

const CREDITS: Credit[] = [
  {
    label: 'Typeface',
    name: 'Plus Jakarta Sans',
    author: 'Tokotype',
    href: 'https://fonts.google.com/specimen/Plus+Jakarta+Sans'
  },
  {
    label: 'Typeface',
    name: 'JetBrains Mono',
    author: 'JetBrains',
    href: 'https://fonts.google.com/specimen/JetBrains+Mono'
  },
  {
    label: 'Brand asset',
    name: 'Instagram glyph',
    author: 'Meta',
    href: 'https://brand.instagram.com'
  },
  {
    label: 'Brand asset',
    name: 'LinkedIn mark',
    author: 'LinkedIn',
    href: 'https://brand.linkedin.com'
  }
];

export const FooterCredits = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs text-ink-faint transition-colors duration-fast hover:text-ink"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Credits
        {/* Info icon */}
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
              <li
                key={credit.name}
                className="flex items-baseline justify-between gap-4 px-4 py-2.5"
              >
                <div>
                  <p className="text-xs font-medium text-ink">{credit.name}</p>
                  <p className="text-[10px] text-ink-faint">{credit.label}</p>
                </div>
                {credit.href ? (
                  <a
                    href={credit.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[10px] text-ink-muted underline-offset-2 hover:underline"
                  >
                    {credit.author}
                  </a>
                ) : (
                  <span className="shrink-0 text-[10px] text-ink-faint">{credit.author}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
