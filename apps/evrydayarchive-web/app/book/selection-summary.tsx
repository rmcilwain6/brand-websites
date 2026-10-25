import {
  modifierDeltaCents,
  modifierDisplayValue,
  type PublicPackage,
  type PublicPackageModifier
} from '@repo/core';

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
  /** `compact`: mobile card above the form. `full`: desktop sidebar, with the package description. */
  variant: 'compact' | 'full';
  className?: string;
};

export const SelectionSummary = ({ selection, variant, className }: Props) => {
  const { pkg, modifiers, modifierValues, estimatedTotalCents } = selection;
  const full = variant === 'full';

  return (
    <div
      className={cn(
        'rounded-card border border-border bg-sun px-5',
        full ? 'py-6' : 'py-5',
        className
      )}
    >
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
        Your selection
      </p>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-base font-semibold text-ink">{pkg.name}</p>
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
                  {displayVal && (
                    <span className="ml-1 text-xs text-ink-faint">({displayVal})</span>
                  )}
                  {m.isRequired && !displayVal && (
                    <span className="ml-1 text-xs text-ink-faint">(included)</span>
                  )}
                </span>
                {delta !== 0 && (
                  <span className="flex-none text-xs tabular-nums text-ink-faint">
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
            <span className="text-xs text-ink-faint">Estimated total</span>
            <span className="text-sm font-semibold text-ink">
              {formatPrice(estimatedTotalCents)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
