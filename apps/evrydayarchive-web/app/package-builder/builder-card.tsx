'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import type {
  IncrementerConfig,
  ModifierType,
  PublicModifierConfig,
  PublicPackage,
  PublicPackageModifier,
  SliderConfig,
  ToggleConfig
} from '@repo/core';

// ── Control type definitions ────────────────────────────────────────────────

type CheckboxState = { type: 'checkbox'; checked: boolean };
type ToggleState = { type: 'toggle'; altSelected: boolean };
type SliderState = { type: 'slider'; value: number };
type IncrementerState = { type: 'incrementer'; count: number };

type ControlState = CheckboxState | ToggleState | SliderState | IncrementerState;

type BuilderItem = {
  id: string;
  name: string;
  description: string | null;
  modifierType: ModifierType;
  isRequired: boolean;
  isIncluded: boolean;
  priceDeltaCents: number | null;
  config: PublicModifierConfig;
  control: ControlState;
};

// ── Price helpers ────────────────────────────────────────────────────────────

const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

const formatDelta = (cents: number): string => {
  if (cents === 0) return '—';
  const sign = cents > 0 ? '+' : '−';
  return `${sign}${formatPrice(Math.abs(cents))}`;
};

const itemPriceDelta = (item: BuilderItem): number => {
  const { control, priceDeltaCents, config } = item;

  if (item.isRequired) return priceDeltaCents ?? 0;

  switch (control.type) {
    case 'checkbox':
      return control.checked ? (priceDeltaCents ?? 0) : 0;

    case 'toggle':
      return control.altSelected ? (priceDeltaCents ?? 0) : 0;

    case 'slider': {
      const cfg = config as SliderConfig;
      return (control.value - cfg.defaultValue) * cfg.pricePerStep;
    }

    case 'incrementer': {
      const cfg = config as IncrementerConfig;
      return (control.count - cfg.defaultValue) * cfg.pricePerUnit;
    }
  }
};

// ── Conversion from API modifier → BuilderItem ───────────────────────────────

const buildInitialControl = (m: PublicPackageModifier): ControlState => {
  switch (m.type) {
    case 'TOGGLE':
      return { type: 'toggle', altSelected: false };
    case 'SLIDER': {
      const cfg = m.config as SliderConfig;
      return { type: 'slider', value: cfg?.defaultValue ?? 0 };
    }
    case 'INCREMENTER': {
      const cfg = m.config as IncrementerConfig;
      return { type: 'incrementer', count: cfg?.defaultValue ?? 0 };
    }
    case 'CHECKBOX':
    default:
      return { type: 'checkbox', checked: m.isRequired || m.isIncluded };
  }
};

const modifierToItem = (m: PublicPackageModifier): BuilderItem => ({
  id: m.id,
  name: m.name,
  description: m.description,
  modifierType: m.type,
  isRequired: m.isRequired,
  isIncluded: m.isIncluded,
  priceDeltaCents: m.priceDeltaCents,
  config: m.config,
  control: buildInitialControl(m)
});

// ── Main component ────────────────────────────────────────────────────────────

export const BuilderCard = ({ pkg }: { pkg: PublicPackage }) => {
  const [items, setItems] = useState<BuilderItem[]>(() => pkg.modifiers.map(modifierToItem));

  const updateControl = useCallback((id: string, next: Partial<ControlState>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, control: { ...item.control, ...next } as ControlState } : item
      )
    );
  }, []);

  const total = useMemo(
    () => (pkg.basePriceCents ?? 0) + items.reduce((sum, item) => sum + itemPriceDelta(item), 0),
    [items, pkg.basePriceCents]
  );

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ package: pkg.slug });

    const selectedIds = items
      .filter((item) => {
        if (item.isRequired) return false;
        const { control } = item;
        if (control.type === 'checkbox') return control.checked;
        if (control.type === 'toggle') return control.altSelected;
        return false;
      })
      .map((item) => item.id);

    if (selectedIds.length > 0) params.set('modifiers', selectedIds.join(','));

    const modifierValues: Record<string, number> = {};
    for (const item of items) {
      const { control } = item;
      if (control.type === 'slider') modifierValues[item.id] = control.value;
      if (control.type === 'incrementer') modifierValues[item.id] = control.count;
    }
    if (Object.keys(modifierValues).length > 0) {
      params.set(
        'modifierValues',
        Object.entries(modifierValues)
          .map(([id, val]) => `${id}:${val}`)
          .join(',')
      );
    }

    return `?${params.toString()}`;
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
      {items.length > 0 && (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <ModifierRow key={item.id} item={item} onChange={updateControl} />
          ))}
        </div>
      )}

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
  const delta = itemPriceDelta(item);
  const isLocked = item.isRequired;

  const priceLabel = (() => {
    if (isLocked) return 'Included';
    if (item.isIncluded && item.modifierType === 'CHECKBOX') {
      const { control } = item;
      if (control.type === 'checkbox' && !control.checked) return formatDelta(delta);
      return 'Included';
    }
    return formatDelta(delta);
  })();

  return (
    <div className="flex items-start gap-4 px-7 py-5">
      {/* Label */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-ink">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">{item.description}</p>
        )}
      </div>

      {/* Control + price */}
      <div className="flex flex-none flex-col items-end gap-1.5">
        <Control item={item} onChange={onChange} />
        <span className="text-xs font-medium text-ink-muted tabular-nums">{priceLabel}</span>
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
  if (item.isRequired) {
    return <LockedCheckmark />;
  }

  const { control } = item;

  if (control.type === 'checkbox') {
    return (
      <CheckboxControl
        checked={control.checked}
        label={item.name}
        onChange={(checked) => onChange(item.id, { type: 'checkbox', checked })}
      />
    );
  }

  if (control.type === 'toggle') {
    const cfg = item.config as ToggleConfig;
    return (
      <ToggleControl
        altSelected={control.altSelected}
        defaultLabel={cfg?.defaultLabel ?? 'Off'}
        altLabel={cfg?.altLabel ?? 'On'}
        onChange={(altSelected) => onChange(item.id, { type: 'toggle', altSelected })}
      />
    );
  }

  if (control.type === 'slider') {
    const cfg = item.config as SliderConfig;
    return (
      <SliderControl
        value={control.value}
        min={cfg?.min ?? 0}
        max={cfg?.max ?? 100}
        step={cfg?.step ?? 1}
        unit={cfg?.unit ?? ''}
        onChange={(value) => onChange(item.id, { type: 'slider', value })}
      />
    );
  }

  if (control.type === 'incrementer') {
    const cfg = item.config as IncrementerConfig;
    return (
      <IncrementerControl
        count={control.count}
        min={cfg?.min ?? 0}
        max={cfg?.max ?? 99}
        unit={cfg?.unit ?? ''}
        onChange={(count) => onChange(item.id, { type: 'incrementer', count })}
      />
    );
  }

  return null;
};

// ── LockedCheckmark ───────────────────────────────────────────────────────────

const LockedCheckmark = () => (
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

// ── CheckboxControl ───────────────────────────────────────────────────────────

type CheckboxControlProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

const CheckboxControl = ({ checked, label, onChange }: CheckboxControlProps) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    aria-label={`${checked ? 'Remove' : 'Add'} ${label}`}
    onClick={() => onChange(!checked)}
    className={[
      'inline-flex h-6 w-6 items-center justify-center rounded-sm border transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
      checked
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

// ── ToggleControl ─────────────────────────────────────────────────────────────

type ToggleControlProps = {
  altSelected: boolean;
  defaultLabel: string;
  altLabel: string;
  onChange: (altSelected: boolean) => void;
};

const ToggleControl = ({ altSelected, defaultLabel, altLabel, onChange }: ToggleControlProps) => (
  <div className="flex overflow-hidden rounded-sm border border-border text-xs font-medium">
    <button
      type="button"
      onClick={() => onChange(false)}
      className={[
        'px-3 py-1.5 transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
        !altSelected ? 'bg-ink text-canvas' : 'bg-canvas text-ink-muted hover:text-ink'
      ].join(' ')}
    >
      {defaultLabel}
    </button>
    <button
      type="button"
      onClick={() => onChange(true)}
      className={[
        'border-l border-border px-3 py-1.5 transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
        altSelected ? 'bg-ink text-canvas' : 'bg-canvas text-ink-muted hover:text-ink'
      ].join(' ')}
    >
      {altLabel}
    </button>
  </div>
);

// ── SliderControl ─────────────────────────────────────────────────────────────

type SliderControlProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
};

const SliderControl = ({ value, min, max, step, unit, onChange }: SliderControlProps) => (
  <div className="flex w-40 flex-col gap-1.5">
    <div className="flex items-center justify-between text-xs text-ink-faint">
      <span>
        {min}
        {unit}
      </span>
      <span className="font-semibold text-ink">
        {value}
        {unit}
      </span>
      <span>
        {max}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent"
      aria-label={`Select value in ${unit}`}
    />
  </div>
);

// ── IncrementerControl ────────────────────────────────────────────────────────

type IncrementerControlProps = {
  count: number;
  min: number;
  max: number;
  unit: string;
  onChange: (count: number) => void;
};

const IncrementerControl = ({ count, min, max, unit, onChange }: IncrementerControlProps) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      aria-label="Decrease"
      disabled={count <= min}
      onClick={() => onChange(Math.max(min, count - 1))}
      className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-border bg-canvas text-ink transition-colors duration-fast hover:border-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
    <span className="w-12 text-center text-sm font-semibold tabular-nums text-ink">
      {count}
      {unit ? ` ${unit}` : ''}
    </span>
    <button
      type="button"
      aria-label="Increase"
      disabled={count >= max}
      onClick={() => onChange(Math.min(max, count + 1))}
      className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-border bg-canvas text-ink transition-colors duration-fast hover:border-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  </div>
);
