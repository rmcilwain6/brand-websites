'use client';

import { useEffect, useRef, useState } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MINUTES = ['00', '15', '30', '45'];

// ── Types ─────────────────────────────────────────────────────────────────────

type Period = 'AM' | 'PM';
type OpenSegment = 'hour' | 'minute' | null;

type Parts = {
  hour: string; // '1'–'12' or ''
  minute: string; // '00','15','30','45' or ''
  period: Period;
};

type Props = {
  id: string;
  value: string; // HH:mm in 24-hour format, or ''
  onChange: (v: string) => void;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const parse = (v: string): Parts => {
  if (!v) return { hour: '', minute: '', period: 'AM' };
  const [hStr = '0', mStr = '00'] = v.split(':');
  const h24 = parseInt(hStr, 10);
  const period: Period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return { hour: String(h12), minute: mStr, period };
};

const to24h = (h12: string, minute: string, period: Period): string => {
  if (!h12 || !minute) return '';
  let h = parseInt(h12, 10);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${minute}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const TimePicker = ({ id, value, onChange }: Props) => {
  const { hour, minute, period } = parse(value);
  const [open, setOpen] = useState<OpenSegment>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const emit = (h: string, m: string, p: Period) => onChange(to24h(h, m, p));

  const toggleOpen = (segment: 'hour' | 'minute') =>
    setOpen((cur) => (cur === segment ? null : segment));

  return (
    <div
      ref={containerRef}
      className="flex items-center rounded-card border border-border bg-canvas transition-colors duration-fast focus-within:border-ink-muted"
    >
      {/* ── Hour ────────────────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <button
          id={id}
          type="button"
          onClick={() => toggleOpen('hour')}
          aria-haspopup="listbox"
          aria-expanded={open === 'hour'}
          aria-label="Hour"
          onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}
          className="flex w-full items-center justify-between py-3 pl-4 pr-2 text-sm focus:outline-none"
        >
          <span className={hour ? 'text-ink' : 'text-ink-faint/60'}>{hour || 'hh'}</span>
          <ChevronDown
            className={[
              'h-3 w-3 text-ink-faint transition-transform duration-fast',
              open === 'hour' ? 'rotate-180' : ''
            ].join(' ')}
          />
        </button>

        {open === 'hour' && (
          <DropdownPanel aria-label="Select hour">
            {HOURS.map((h) => (
              <OptionButton
                key={h}
                label={h}
                selected={hour === h}
                onClick={() => {
                  emit(h, minute || '00', period);
                  setOpen(null);
                }}
              />
            ))}
          </DropdownPanel>
        )}
      </div>

      {/* ── Separator ───────────────────────────────────────────────────────── */}
      <span className="select-none text-sm font-medium text-ink-faint" aria-hidden="true">
        :
      </span>

      {/* ── Minute ──────────────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <button
          type="button"
          onClick={() => toggleOpen('minute')}
          aria-haspopup="listbox"
          aria-expanded={open === 'minute'}
          aria-label="Minute"
          onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}
          className="flex w-full items-center justify-between py-3 pl-3 pr-2 text-sm focus:outline-none"
        >
          <span className={minute ? 'text-ink' : 'text-ink-faint/60'}>{minute || 'mm'}</span>
          <ChevronDown
            className={[
              'h-3 w-3 text-ink-faint transition-transform duration-fast',
              open === 'minute' ? 'rotate-180' : ''
            ].join(' ')}
          />
        </button>

        {open === 'minute' && (
          <DropdownPanel aria-label="Select minute">
            {MINUTES.map((m) => (
              <OptionButton
                key={m}
                label={m}
                selected={minute === m}
                onClick={() => {
                  emit(hour || '12', m, period);
                  setOpen(null);
                }}
              />
            ))}
          </DropdownPanel>
        )}
      </div>

      {/* ── AM / PM ─────────────────────────────────────────────────────────── */}
      <div
        className="flex flex-none items-center gap-0.5 border-l border-border px-2 py-2"
        role="group"
        aria-label="AM or PM"
      >
        {(['AM', 'PM'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => emit(hour || '12', minute || '00', p)}
            aria-pressed={period === p}
            className={[
              'rounded-placard px-2 py-1 text-xs font-medium transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
              period === p ? 'bg-ink text-canvas' : 'text-ink-faint hover:text-ink-muted'
            ].join(' ')}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const DropdownPanel = ({
  children,
  'aria-label': ariaLabel
}: {
  children: React.ReactNode;
  'aria-label': string;
}) => (
  <ul
    role="listbox"
    aria-label={ariaLabel}
    className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-48 min-w-full overflow-y-auto rounded-card border border-border bg-canvas py-1 shadow-warm"
  >
    {children}
  </ul>
);

const OptionButton = ({
  label,
  selected,
  onClick
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <li role="option" aria-selected={selected}>
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full px-4 py-2 text-left text-sm transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
        selected ? 'bg-accent font-medium text-white' : 'text-ink-muted hover:bg-sun hover:text-ink'
      ].join(' ')}
    >
      {label}
    </button>
  </li>
);

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
