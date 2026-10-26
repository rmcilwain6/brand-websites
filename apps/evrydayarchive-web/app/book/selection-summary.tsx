'use client';

import { useState } from 'react';

import type { PublicPackage, PublicPackageModifier } from '@repo/core';
// Subpath import keeps the core package's Zod schemas out of the client bundle.
import { modifierDeltaCents, modifierDisplayValue } from '@repo/core/pricing';

import { cn } from '../lib/cn';

/** The package configuration a booking is being requested for. */
export type BookingSelection = {
  pkg: PublicPackage;
  /** Modifiers that affect this booking: required, selected, or moved off their default. */
  modifiers: PublicPackageModifier[];
  /** SLIDER / INCREMENTER values keyed by modifier id. */
  modifierValues: Record<string, number>;
  estimatedTotalCents: number | undefined;
};

const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

type Props = {
  selection: BookingSelection;
  /**
   * `compact`: mobile bar above the form, collapsed to the package and total until tapped.
   * `full`: desktop sidebar, with the package description.
   */
  variant: 'compact' | 'full';
  className?: string;
};

export const SelectionSummary = ({ selection, variant, className }: Props) =>
  variant === 'full' ? (
    <div className={cn('rounded-card border border-border bg-sun px-5 py-6', className)}>
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-soft">
        Your selection
      </p>
      <SelectionDetails selection={selection} full />
    </div>
  ) : (
    <CollapsibleSummary selection={selection} className={className} />
  );

const CollapsibleSummary = ({
  selection,
  className
}: {
  selection: BookingSelection;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { pkg, estimatedTotalCents } = selection;
  const headlineCents = estimatedTotalCents ?? pkg.basePriceCents;

  return (
    <div className={cn('rounded-card border border-border bg-sun', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="selection-summary-details"
        className="flex w-full items-center gap-3 rounded-card px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-widest text-ink-soft">
            Your selection
          </span>
          <span className="truncate text-base font-semibold text-ink">{pkg.name}</span>
        </span>
        {headlineCents != null && (
          <span className="flex-none text-sm font-semibold tabular-nums text-ink">
            {estimatedTotalCents != null && (
              <span className="mr-1 text-[13px] font-normal text-ink-soft">Est.</span>
            )}
            {formatPrice(headlineCents)}
          </span>
        )}
        <ChevronDown
          className={cn(
            'h-3 w-3 flex-none text-ink-soft transition-transform duration-fast',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div id="selection-summary-details" className="animate-fade-in px-5 pb-5">
          <div className="border-t border-border pt-4">
            <SelectionDetails selection={selection} full={false} />
          </div>
        </div>
      )}
    </div>
  );
};

/** Package line, active modifiers and the estimated total. */
const SelectionDetails = ({ selection, full }: { selection: BookingSelection; full: boolean }) => {
  const { pkg, modifiers, modifierValues, estimatedTotalCents } = selection;

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn('font-semibold text-ink', full ? 'text-base' : 'text-sm')}>{pkg.name}</p>
        {pkg.basePriceCents != null && (
          <span className="flex-none text-sm tabular-nums text-ink">
            {formatPrice(pkg.basePriceCents)}
          </span>
        )}
      </div>
      {full && pkg.description && (
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{pkg.description}</p>
      )}

      {modifiers.length > 0 && (
        <ul className={full ? 'mt-4 space-y-2 border-t border-border pt-4' : 'mt-2 space-y-1'}>
          {modifiers.map((m) => {
            const displayVal = modifierDisplayValue(m, modifierValues);
            const delta = modifierDeltaCents(m, modifierValues);
            return (
              <li key={m.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink-muted">
                  {m.name}
                  {displayVal && <span className="ml-1 text-xs text-ink-soft">({displayVal})</span>}
                  {m.isRequired && !displayVal && (
                    <span className="ml-1 text-xs text-ink-soft">(included)</span>
                  )}
                </span>
                {delta !== 0 && (
                  <span className="flex-none text-xs tabular-nums text-ink-soft">
                    {delta > 0 ? '+' : ''}
                    {formatPrice(delta)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {estimatedTotalCents != null && (
        <div
          className={full ? 'mt-4 border-t border-border pt-4' : 'mt-3 border-t border-border pt-3'}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-ink-soft">Estimated total</span>
            <span className="text-sm font-semibold text-ink">
              {formatPrice(estimatedTotalCents)}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 10 6" fill="none" aria-hidden="true">
    <path
      d="M1 1l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
