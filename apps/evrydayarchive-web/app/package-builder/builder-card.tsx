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
      const steps = Math.round((control.value - cfg.defaultValue) / cfg.step);
      return steps * cfg.pricePerStep;
    }
    case 'incrementer': {
      const cfg = config as IncrementerConfig;
      return (control.count - cfg.defaultValue) * cfg.pricePerUnit;
    }
  }
};

// ── Cross-modifier constraints ────────────────────────────────────────────────
// If any "location" modifier is active, the first time-unit SLIDER must be >= 90 min.

const LOCATION_MIN_MINUTES = 90;

const isLocationActive = (items: BuilderItem[]): boolean =>
  items.some((item) => {
    if (!item.name.toLowerCase().includes('location')) return false;
    const { control } = item;
    if (control.type === 'checkbox') return control.checked;
    if (control.type === 'toggle') return control.altSelected;
    return false;
  });

const isTimeSlider = (item: BuilderItem): boolean => {
  if (item.control.type !== 'slider') return false;
  const cfg = item.config as SliderConfig;
  return (
    cfg?.unit?.toLowerCase().includes('min') ||
    item.name.toLowerCase().includes('duration') ||
    item.name.toLowerCase().includes('time')
  );
};

const applyConstraints = (items: BuilderItem[]): BuilderItem[] => {
  if (!isLocationActive(items)) return items;
  return items.map((item) => {
    if (!isTimeSlider(item)) return item;
    const slider = item.control as SliderState;
    if (slider.value < LOCATION_MIN_MINUTES) {
      return { ...item, control: { type: 'slider', value: LOCATION_MIN_MINUTES } };
    }
    return item;
  });
};

const getSliderEffectiveMin = (item: BuilderItem, items: BuilderItem[]): number => {
  const cfg = item.config as SliderConfig;
  const base = cfg?.min ?? 0;
  if (!isTimeSlider(item)) return base;
  return isLocationActive(items) ? Math.max(base, LOCATION_MIN_MINUTES) : base;
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
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, control: { ...item.control, ...next } as ControlState } : item
      );
      return applyConstraints(updated);
    });
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
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-start gap-6">
        {/* ── Builder card ─────────────────────────────────────────── */}
        <div className="min-w-0 flex-1 rounded-card border border-border bg-canvas shadow-warm-sm">
          {/* Header */}
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

          {/* Modifier rows */}
          {items.length > 0 && (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <ModifierRow key={item.id} item={item} allItems={items} onChange={updateControl} />
              ))}
            </div>
          )}

          {/* Total + CTA */}
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

        {/* ── Sticky price widget (desktop only) ───────────────────── */}
        <aside className="sticky top-6 hidden w-52 shrink-0 lg:block">
          <PriceWidget pkg={pkg} items={items} total={total} />
        </aside>
      </div>
    </div>
  );
};

// ── PriceWidget ───────────────────────────────────────────────────────────────

type PriceWidgetProps = {
  pkg: PublicPackage;
  items: BuilderItem[];
  total: number;
};

const PriceWidget = ({ pkg, items, total }: PriceWidgetProps) => {
  const activeLines = useMemo(() => {
    return items
      .map((item) => ({ name: item.name, delta: itemPriceDelta(item) }))
      .filter((line) => line.delta !== 0);
  }, [items]);

  return (
    <div className="rounded-card border border-border bg-canvas p-5 shadow-warm-sm">
      <p className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-faint">Summary</p>

      <div className="space-y-2.5 text-sm">
        {pkg.basePriceCents != null && (
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-ink-muted">{pkg.name}</span>
            <span className="shrink-0 tabular-nums text-ink">
              {formatPrice(pkg.basePriceCents)}
            </span>
          </div>
        )}
        {activeLines.map((line) => (
          <div key={line.name} className="flex items-baseline justify-between gap-2">
            <span className="truncate text-ink-muted">{line.name}</span>
            <span
              className={[
                'shrink-0 tabular-nums',
                line.delta > 0 ? 'text-ink' : 'text-ink-muted'
              ].join(' ')}
            >
              {formatDelta(line.delta)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-xs text-ink-faint">Total</span>
        <span className="text-xl font-semibold tabular-nums text-ink">{formatPrice(total)}</span>
      </div>
    </div>
  );
};

// ── ModifierRow ───────────────────────────────────────────────────────────────

type ModifierRowProps = {
  item: BuilderItem;
  allItems: BuilderItem[];
  onChange: (id: string, next: Partial<ControlState>) => void;
};

const ModifierRow = ({ item, allItems, onChange }: ModifierRowProps) => {
  const delta = itemPriceDelta(item);
  const isLocked = item.isRequired;

  const priceLabel = (() => {
    if (isLocked) return 'Included';
    if (item.isIncluded && item.modifierType === 'CHECKBOX') {
      const ctrl = item.control as CheckboxState;
      return ctrl.checked ? 'Included' : formatDelta(delta);
    }
    return formatDelta(delta);
  })();

  return (
    <div className="flex items-start gap-4 px-7 py-5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-ink">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">{item.description}</p>
        )}
      </div>
      <div className="flex flex-none flex-col items-end gap-1.5">
        <Control item={item} allItems={allItems} onChange={onChange} />
        <span className="text-xs font-medium text-ink-muted tabular-nums">{priceLabel}</span>
      </div>
    </div>
  );
};

// ── Control dispatcher ────────────────────────────────────────────────────────

type ControlProps = {
  item: BuilderItem;
  allItems: BuilderItem[];
  onChange: (id: string, next: Partial<ControlState>) => void;
};

const Control = ({ item, allItems, onChange }: ControlProps) => {
  if (item.isRequired) return <LockedCheckmark />;

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
    const effectiveMin = getSliderEffectiveMin(item, allItems);
    return (
      <SliderControl
        value={control.value}
        min={effectiveMin}
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
  <>
    {/* Mobile: vertical stacked pill */}
    <button
      type="button"
      role="switch"
      aria-checked={altSelected}
      onClick={() => onChange(!altSelected)}
      className="relative flex w-24 flex-col overflow-hidden rounded-xl border border-border bg-canvas text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:hidden"
    >
      <span
        aria-hidden="true"
        className={[
          'pointer-events-none absolute inset-x-0.5 rounded-lg bg-accent transition-[top,bottom] duration-200 ease-in-out',
          altSelected ? 'top-[calc(50%+2px)] bottom-0.5' : 'top-0.5 bottom-[calc(50%+2px)]'
        ].join(' ')}
      />
      <span
        className={[
          'relative z-10 px-3 py-3 text-center transition-colors duration-200',
          !altSelected ? 'text-white' : 'text-ink-muted'
        ].join(' ')}
      >
        {defaultLabel}
      </span>
      <span
        className={[
          'relative z-10 px-3 py-3 text-center transition-colors duration-200',
          altSelected ? 'text-white' : 'text-ink-muted'
        ].join(' ')}
      >
        {altLabel}
      </span>
    </button>

    {/* sm+: horizontal pill */}
    <button
      type="button"
      role="switch"
      aria-checked={altSelected}
      onClick={() => onChange(!altSelected)}
      className="relative hidden h-8 min-w-[96px] grid-cols-2 items-center overflow-hidden rounded-full border border-border bg-canvas text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:grid"
    >
      <span
        aria-hidden="true"
        className={[
          'pointer-events-none absolute inset-y-0.5 rounded-full bg-accent transition-[left,right] duration-200 ease-in-out',
          altSelected ? 'left-[calc(50%+2px)] right-0.5' : 'left-0.5 right-[calc(50%+2px)]'
        ].join(' ')}
      />
      <span
        className={[
          'relative z-10 px-3 text-center transition-colors duration-200',
          !altSelected ? 'text-white' : 'text-ink-muted'
        ].join(' ')}
      >
        {defaultLabel}
      </span>
      <span
        className={[
          'relative z-10 px-3 text-center transition-colors duration-200',
          altSelected ? 'text-white' : 'text-ink-muted'
        ].join(' ')}
      >
        {altLabel}
      </span>
    </button>
  </>
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
  <div className="flex w-40 flex-col items-center gap-1.5">
    <span className="text-sm font-semibold tabular-nums text-ink">
      {value}
      {unit}
    </span>
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
