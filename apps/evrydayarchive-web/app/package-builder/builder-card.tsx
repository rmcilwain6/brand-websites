'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import type { PublicPackage, PublicPackageModifier } from '@repo/core';

// ── Control type definitions ────────────────────────────────────────────────

type CheckboxState = { type: 'checkbox'; checked: boolean };

type ControlState = CheckboxState;

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
  return item.control.checked ? (item.basePriceDeltaCents ?? 0) : 0;
};

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
  const initialItems: BuilderItem[] = pkg.modifiers.map(modifierToItem);

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
      .filter((item) => item.control.checked && !item.isRequired)
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

  return null;
};
