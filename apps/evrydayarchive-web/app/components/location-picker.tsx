'use client';

import { useEffect, useRef, useState } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

export const CORE_LOCATIONS = ['Kamloops', 'Victoria', 'Vancouver', 'Nanaimo'] as const;
export type CoreLocation = (typeof CORE_LOCATIONS)[number];

const OPTIONS: { value: CoreLocation | 'Other'; label: string }[] = [
  ...CORE_LOCATIONS.map((loc) => ({ value: loc as CoreLocation | 'Other', label: loc })),
  { value: 'Other', label: 'Other / not sure' }
];

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  id: string;
  value: CoreLocation | 'Other' | '';
  onChange: (v: CoreLocation | 'Other' | '') => void;
  placeholder?: string;
  hasError?: boolean;
  'aria-describedby'?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const LocationPicker = ({
  id,
  value,
  onChange,
  placeholder = 'Select a location…',
  hasError = false,
  'aria-describedby': ariaDescribedby
}: Props) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedLabel = OPTIONS.find((o) => o.value === value)?.label ?? '';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-describedby={ariaDescribedby}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className={[
          'flex w-full items-center justify-between rounded-card border bg-canvas px-4 py-3 text-left text-sm transition-colors duration-fast focus:outline-none',
          hasError ? 'border-red-300 focus:border-red-400' : 'border-border focus:border-ink-muted'
        ].join(' ')}
      >
        <span className={value ? 'text-ink' : 'text-ink-faint/70'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={[
            'ml-2 h-3 w-3 flex-none text-ink-faint transition-transform duration-fast',
            open ? 'rotate-180' : ''
          ].join(' ')}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <ul
          role="listbox"
          aria-label="Select a location"
          className="absolute left-0 top-[calc(100%+6px)] z-20 w-full overflow-hidden rounded-card border border-border bg-canvas py-1 shadow-warm"
        >
          {OPTIONS.map((opt) => (
            <li key={opt.value} role="option" aria-selected={value === opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={[
                  'w-full px-4 py-2.5 text-left text-sm transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
                  value === opt.value
                    ? 'bg-accent font-medium text-white'
                    : 'text-ink-muted hover:bg-sun hover:text-ink'
                ].join(' ')}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ── Icon ──────────────────────────────────────────────────────────────────────

const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 10 6"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
