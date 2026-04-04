'use client';

import { useEffect, useRef, useState } from 'react';

import type { LocationWindow } from '@repo/core';

// ── Constants ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  id: string;
  value: string; // YYYY-MM-DD or ''
  onChange: (v: string) => void;
  min?: string; // YYYY-MM-DD — dates before this are disabled
  unavailableDates?: Set<string>; // YYYY-MM-DD dates explicitly marked unavailable
  locationWindows?: LocationWindow[]; // schedule windows shown in the side panel
  placeholder?: string;
  hasError?: boolean;
  'aria-describedby'?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// Parse YYYY-MM-DD safely as local date (avoids UTC midnight offset issues)
const parseLocal = (s: string) => new Date(s + 'T12:00:00');

const toYMD = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const fmtWindowDate = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' }).format(new Date(iso));

// ── Component ─────────────────────────────────────────────────────────────────

export const DatePicker = ({
  id,
  value,
  onChange,
  min,
  unavailableDates,
  locationWindows,
  placeholder = 'Select a date',
  hasError = false,
  'aria-describedby': ariaDescribedby
}: Props) => {
  const today = new Date();

  const initView = value ? parseLocal(value) : today;
  const [viewYear, setViewYear] = useState(initView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initView.getMonth());
  const [open, setOpen] = useState(false);
  const [focusedDay, setFocusedDay] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // ── Close on outside click ──────────────────────────────────────────────

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

  // ── Focus management ────────────────────────────────────────────────────

  // When calendar opens, focus the selected day (or today, or first valid day)
  useEffect(() => {
    if (!open) return;
    const selectedDate = value ? parseLocal(value) : null;
    const inView =
      selectedDate &&
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth;

    const initial = inView
      ? selectedDate!.getDate()
      : viewYear === today.getFullYear() && viewMonth === today.getMonth()
        ? today.getDate()
        : 1;

    setFocusedDay(initial);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Move DOM focus when focusedDay changes
  useEffect(() => {
    if (focusedDay !== null && open) {
      dayRefs.current[focusedDay]?.focus();
    }
  }, [focusedDay, open]);

  // ── Calendar grid logic ──────────────────────────────────────────────────

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Map JS Sunday=0 → Monday=0 so the grid starts on Monday
  const firstDayDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const totalCells = Math.ceil((firstDayDow + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = i - firstDayDow + 1;
    return d >= 1 && d <= daysInMonth ? d : null;
  });

  const minDate = min ? parseLocal(min) : null;

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  };

  const isUnavailable = (day: number) => !!unavailableDates?.has(toYMD(viewYear, viewMonth, day));

  const isSelected = (day: number) => value === toYMD(viewYear, viewMonth, day);

  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  // ── Schedule panel ───────────────────────────────────────────────────────

  const showSchedulePanel = !!locationWindows && locationWindows.length > 0;

  const monthWindows = showSchedulePanel
    ? locationWindows.filter((w) => {
        const wStart = new Date(w.startDate);
        const wEnd = new Date(w.endDate);
        const mStart = new Date(viewYear, viewMonth, 1);
        const mEnd = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59);
        return wStart <= mEnd && wEnd >= mStart;
      })
    : [];

  // ── Actions ──────────────────────────────────────────────────────────────

  const selectDay = (day: number) => {
    if (isDisabled(day) || isUnavailable(day)) return;
    onChange(toYMD(viewYear, viewMonth, day));
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (focusedDay === null) return;

    let next = focusedDay;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        next = Math.min(daysInMonth, focusedDay + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        next = Math.max(1, focusedDay - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        next = Math.min(daysInMonth, focusedDay + 7);
        break;
      case 'ArrowUp':
        e.preventDefault();
        next = Math.max(1, focusedDay - 7);
        break;
      case 'Home':
        e.preventDefault();
        next = 1;
        break;
      case 'End':
        e.preventDefault();
        next = daysInMonth;
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        return;
      default:
        return;
    }

    setFocusedDay(next);
  };

  // ── Display value ────────────────────────────────────────────────────────

  const displayValue = value
    ? new Intl.DateTimeFormat('en-CA', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(parseLocal(value))
    : '';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={ariaDescribedby}
        className={[
          'flex w-full items-center justify-between rounded-card border bg-canvas px-4 py-3 text-left text-sm transition-colors duration-fast focus:outline-none',
          hasError ? 'border-red-300 focus:border-red-400' : 'border-border focus:border-ink-muted'
        ].join(' ')}
      >
        <span className={value ? 'text-ink' : 'text-ink-faint/70'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="ml-2 h-4 w-4 flex-none text-ink-faint" />
      </button>

      {/* Calendar panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="absolute left-0 top-[calc(100%+6px)] z-20 rounded-card border border-border bg-canvas shadow-warm lg:flex"
          style={{
            width: showSchedulePanel
              ? 'max(100%, min(472px, 100vw - 2rem))' // 296px calendar + 176px panel (w-44)
              : 'max(100%, min(296px, 100vw - 2rem))'
          }}
        >
          {/* Calendar side — fills the natural width on mobile, flex-1 on desktop */}
          <div className="flex-1">
            {/* Month / year header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className="flex h-7 w-7 items-center justify-center rounded-placard border border-border text-ink-faint transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <span className="text-sm font-semibold text-ink">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="flex h-7 w-7 items-center justify-center rounded-placard border border-border text-ink-faint transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Day grid */}
            <div className="p-3">
              {/* Day-of-week headers */}
              <div className="mb-1 grid grid-cols-7">
                {DAY_LABELS.map((d) => (
                  <div
                    key={d}
                    className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-ink-faint"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div
                className="grid grid-cols-7 gap-y-0.5"
                role="grid"
                aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
                onKeyDown={handleGridKeyDown}
              >
                {cells.map((day, idx) => {
                  if (!day) {
                    return <div key={idx} role="gridcell" aria-hidden="true" />;
                  }

                  const selected = isSelected(day);
                  const todayCell = isToday(day);
                  const disabled = isDisabled(day);
                  const unavailable = !disabled && isUnavailable(day);

                  return (
                    <div key={idx} role="gridcell">
                      <button
                        ref={(el) => {
                          dayRefs.current[day] = el;
                        }}
                        type="button"
                        disabled={disabled}
                        onClick={() => selectDay(day)}
                        tabIndex={focusedDay === day ? 0 : -1}
                        aria-label={`${MONTH_NAMES[viewMonth]} ${day}, ${viewYear}${selected ? ' (selected)' : ''}${unavailable ? ' (not available)' : ''}`}
                        aria-pressed={selected}
                        aria-disabled={disabled || unavailable}
                        title={unavailable ? 'Not available' : undefined}
                        className={[
                          'mx-auto flex h-8 w-8 items-center justify-center rounded-card text-sm transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
                          selected
                            ? 'bg-accent font-medium text-white'
                            : disabled
                              ? 'cursor-not-allowed text-ink-faint opacity-30'
                              : unavailable
                                ? 'cursor-not-allowed bg-red-100 text-red-500 dark:bg-red-950/40 dark:text-red-500'
                                : todayCell
                                  ? 'font-medium text-ink ring-1 ring-inset ring-border hover:bg-sun'
                                  : 'text-ink-muted hover:bg-sun hover:text-ink'
                        ].join(' ')}
                      >
                        {day}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center gap-3 border-t border-border pt-2.5">
                <span className="flex items-center gap-1.5 text-[10px] text-ink-faint">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-red-100 text-[9px] text-red-500 dark:bg-red-950/40">
                    ✕
                  </span>
                  Unavailable
                </span>
              </div>
            </div>
          </div>

          {/* Schedule panel — desktop only, attached to the right of the popup */}
          {showSchedulePanel && (
            <div className="hidden w-44 flex-none border-l border-border p-4 lg:block">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                Where I&apos;ll be
              </p>
              {monthWindows.length === 0 ? (
                <p className="text-xs leading-relaxed text-ink-faint">
                  No schedule set for this month.
                </p>
              ) : (
                <ul className="space-y-3">
                  {monthWindows.map((w) => (
                    <li key={w.id}>
                      <p className="text-xs font-medium text-ink">{w.location.name}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-ink-faint">
                        {fmtWindowDate(w.startDate)} – {fmtWindowDate(w.endDate)}
                      </p>
                      {w.notes && (
                        <p className="mt-0.5 text-[11px] leading-snug text-ink-faint">{w.notes}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M5 1.5V4M11 1.5V4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 8 12"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 10L2 6l4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 8 12"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 10l4-4-4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
