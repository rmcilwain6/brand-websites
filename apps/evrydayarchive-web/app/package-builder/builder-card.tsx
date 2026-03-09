'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import type { PublicPackage, PublicPackageModifier } from '@repo/core';

// ── Control type definitions ────────────────────────────────────────────────
// The current API modifier model is binary (add/remove via checkbox).
// Stepper and slider controls are demonstrated here as POC items; they will be
// driven by the API once the questionnaire/modifier engine supports control types.

type CheckboxState = { type: 'checkbox'; checked: boolean };
type StepperState = {
  type: 'stepper';
  value: number;
  min: number;
  max: number;
  step: number;
  pricePerUnitCents: number;
};
type SliderState = {
  type: 'slider';
  value: number;
  min: number;
  max: number;
  step: number;
  pricePerUnitCents: number;
};

type ControlState = CheckboxState | StepperState | SliderState;

type BuilderItem = {
  id: string;
  name: string;
  description: string | null;
  basePriceDeltaCents: number | null;
  isRequired: boolean;
  control: ControlState;
};

// ── Price helpers ────────────────────────────────────────────────────────────

const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

const itemPrice = (item: BuilderItem): number => {
  if (item.isRequired) return item.basePriceDeltaCents ?? 0;
  const { control } = item;
  if (control.type === 'checkbox') {
    return control.checked ? (item.basePriceDeltaCents ?? 0) : 0;
  }
  if (control.type === 'stepper' || control.type === 'slider') {
    return control.value * control.pricePerUnitCents;
  }
  return 0;
};

// ── POC demo items (hardcoded to showcase stepper + slider controls) ─────────
// These would eventually be driven by API-configurable modifier types.

const DEMO_ITEMS: BuilderItem[] = [
  {
    id: 'poc-subjects',
    name: 'Additional subjects',
    description: 'Base session includes up to 2 people. Add more here.',
    basePriceDeltaCents: null,
    isRequired: false,
    control: { type: 'stepper', value: 0, min: 0, max: 8, step: 1, pricePerUnitCents: 2500 }
  },
  {
    id: 'poc-print-credit',
    name: 'Print credit',
    description: 'Put toward prints, albums, or wall art after delivery.',
    basePriceDeltaCents: null,
    isRequired: false,
    control: { type: 'slider', value: 0, min: 0, max: 20000, step: 2500, pricePerUnitCents: 1 }
  }
];

// ── Conversion from API modifier → BuilderItem ───────────────────────────────

const modifierToItem = (m: PublicPackageModifier): BuilderItem => ({
  id: m.id,
  name: m.name,
  description: m.description,
  basePriceDeltaCents: m.priceDeltaCents,
  isRequired: m.isRequired,
  control: { type: 'checkbox', checked: m.isRequired }
});

// ── Main component ────────────────────────────────────────────────────────────

export const BuilderCard = ({ pkg }: { pkg: PublicPackage }) => {
  const initialItems: BuilderItem[] = [...pkg.modifiers.map(modifierToItem), ...DEMO_ITEMS];

  const [items, setItems] = useState<BuilderItem[]>(initialItems);

  const updateControl = useCallback((id: string, next: Partial<ControlState>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, control: { ...item.control, ...next } as ControlState } : item
      )
    );
  }, []);

  const total = useMemo(
    () => (pkg.basePriceCents ?? 0) + items.reduce((sum, item) => sum + itemPrice(item), 0),
    [items, pkg.basePriceCents]
  );

  const queryString = useMemo(() => {
    const selected = items
      .filter((item) => {
        const { control } = item;
        if (control.type === 'checkbox') return control.checked && !item.isRequired;
        return (control.value ?? 0) > 0;
      })
      .map((item) => item.id)
      .join(',');
    return selected ? `?package=${pkg.slug}&modifiers=${selected}` : `?package=${pkg.slug}`;
  }, [items, pkg.slug]);

  return (
    <div className="mx-auto w-full max-w-xl rounded-card border border-border bg-canvas shadow-warm-sm">
      {/* ── Package header ─────────────────────────────────────────── */}
      <div className="border-b border-border px-7 py-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
          Package builder
        </p>
        <h1 className="text-2xl font-semibold leading-snug text-ink">{pkg.name}</h1>
        {pkg.description && (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{pkg.description}</p>
        )}
        {pkg.basePriceCents != null && (
          <p className="mt-4 text-sm text-ink-faint">
            Base price:{' '}
            <span className="font-semibold text-ink">{formatPrice(pkg.basePriceCents)}</span>
          </p>
        )}
      </div>

      {/* ── Modifier rows ───────────────────────────────────────────── */}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <ModifierRow key={item.id} item={item} onChange={updateControl} />
        ))}
      </div>

      {/* ── Total + CTA ────────────────────────────────────────────── */}
      <div className="border-t border-border px-7 py-6">
        <div className="mb-5 flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink-muted">Estimated total</span>
          <span className="text-2xl font-semibold text-ink">{formatPrice(total)}</span>
        </div>
        <p className="mb-5 text-xs leading-relaxed text-ink-faint">
          Prices are estimates. Final scope and pricing is confirmed after we talk through the
          details.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/book${queryString}`}
            className="block rounded-card bg-accent px-6 py-3 text-center text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Proceed to booking
          </Link>
          <Link
            href="/packages"
            className="block rounded-card border border-border px-6 py-3 text-center text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            View all packages
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── ModifierRow ───────────────────────────────────────────────────────────────

type ModifierRowProps = {
  item: BuilderItem;
  onChange: (id: string, next: Partial<ControlState>) => void;
};

const ModifierRow = ({ item, onChange }: ModifierRowProps) => {
  const price = itemPrice(item);
  const showPrice = price !== 0 || !item.isRequired;

  return (
    <div className="flex items-start gap-4 px-7 py-5">
      {/* Label */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-ink">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">{item.description}</p>
        )}
      </div>

      {/* Control */}
      <div className="flex flex-none flex-col items-end gap-1.5">
        <Control item={item} onChange={onChange} />
        {/* Price delta */}
        <span className="text-xs font-medium text-ink-muted tabular-nums">
          {item.isRequired
            ? 'Included'
            : showPrice && price !== 0
              ? `+${formatPrice(price)}`
              : price === 0
                ? '—'
                : null}
        </span>
      </div>
    </div>
  );
};

// ── Control renderers ─────────────────────────────────────────────────────────

type ControlProps = {
  item: BuilderItem;
  onChange: (id: string, next: Partial<ControlState>) => void;
};

const Control = ({ item, onChange }: ControlProps) => {
  const { control } = item;

  if (item.isRequired) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-border bg-ink/5 text-ink-faint">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M2 6l3 3 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (control.type === 'checkbox') {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={control.checked}
        aria-label={`${control.checked ? 'Remove' : 'Add'} ${item.name}`}
        onClick={() => onChange(item.id, { type: 'checkbox', checked: !control.checked })}
        className={[
          'inline-flex h-6 w-6 items-center justify-center rounded-sm border transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
          control.checked
            ? 'border-accent bg-accent text-white'
            : 'border-border bg-canvas text-transparent hover:border-ink-muted'
        ].join(' ')}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M2 6l3 3 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  if (control.type === 'stepper') {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${item.name}`}
          disabled={control.value <= control.min}
          onClick={() =>
            onChange(item.id, {
              type: 'stepper',
              value: Math.max(control.min, control.value - control.step)
            } as Partial<StepperState>)
          }
          className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <svg width="10" height="2" viewBox="0 0 10 2" fill="none" aria-hidden="true">
            <path d="M1 1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <span className="w-5 text-center text-sm font-medium tabular-nums text-ink">
          {control.value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${item.name}`}
          disabled={control.value >= control.max}
          onClick={() =>
            onChange(item.id, {
              type: 'stepper',
              value: Math.min(control.max, control.value + control.step)
            } as Partial<StepperState>)
          }
          className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    );
  }

  if (control.type === 'slider') {
    const displayValue = control.value * control.pricePerUnitCents;
    return (
      <div className="flex w-36 flex-col gap-1.5">
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={control.value}
          aria-label={item.name}
          onChange={(e) =>
            onChange(item.id, {
              type: 'slider',
              value: Number(e.target.value)
            } as Partial<SliderState>)
          }
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent"
        />
        <span className="text-right text-xs tabular-nums text-ink-muted">
          {displayValue === 0 ? 'None' : formatPrice(displayValue)}
        </span>
      </div>
    );
  }

  return null;
};
