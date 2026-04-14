import Link from 'next/link';

import {
  fetchPublicAvailability,
  fetchPublicSchedule,
  fetchPublicPackages,
  type IncrementerConfig,
  type LocationWindow,
  type PublicPackage,
  type PublicPackageModifier,
  type SliderConfig,
  type TimeSlot
} from '@repo/core';

import { getServerEnv } from '../lib/env';
import { isSaleDiscountActive, applyDiscount, SALE } from '../lib/sale';
import { BookingForm } from './booking-form';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    package?: string;
    modifiers?: string;
    modifierValues?: string;
    from?: string;
  }>;
};

const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

// ── Price helpers ─────────────────────────────────────────────────────────────

const computeModifierDelta = (m: PublicPackageModifier, values: Record<string, number>): number => {
  if (m.type === 'SLIDER') {
    const cfg = m.config as SliderConfig | null;
    if (!cfg) return 0;
    const value = values[m.id] ?? cfg.defaultValue;
    const steps = Math.round((value - cfg.defaultValue) / cfg.step);
    return steps * cfg.pricePerStep;
  }
  if (m.type === 'INCREMENTER') {
    const cfg = m.config as IncrementerConfig | null;
    if (!cfg) return 0;
    const count = values[m.id] ?? cfg.defaultValue;
    return (count - cfg.defaultValue) * cfg.pricePerUnit;
  }
  return m.priceDeltaCents ?? 0;
};

export default async function BookPage({ searchParams }: Props) {
  const {
    package: packageSlug,
    modifiers: modifiersParam,
    modifierValues: modifierValuesParam,
    from
  } = await searchParams;
  const { ADMIN_API_BASE_URL } = getServerEnv();

  const rangeFrom = new Date().toISOString().split('T')[0]!;
  const rangeToDate = new Date();
  rangeToDate.setMonth(rangeToDate.getMonth() + 18);
  const rangeTo = rangeToDate.toISOString().split('T')[0]!;

  let packages: PublicPackage[] = [];
  let timeSlots: TimeSlot[] = [];
  let locationWindows: LocationWindow[] = [];

  await Promise.allSettled([
    fetchPublicPackages(ADMIN_API_BASE_URL, { next: { revalidate: 60 } }).then(
      (r) => (packages = r)
    ),
    fetchPublicAvailability(ADMIN_API_BASE_URL, { from: rangeFrom, to: rangeTo }).then(
      (r) => (timeSlots = r)
    ),
    fetchPublicSchedule(ADMIN_API_BASE_URL, { from: rangeFrom, to: rangeTo }).then(
      (r) => (locationWindows = r)
    )
  ]);

  // Resolve package by slug
  const pkg = packageSlug ? packages.find((p) => p.slug === packageSlug) : undefined;

  // Parse selected modifier IDs (CHECKBOX / TOGGLE)
  const selectedModifierIds = modifiersParam ? modifiersParam.split(',').filter(Boolean) : [];

  // Parse slider / incrementer values from "id:value,id:value,..." format
  const modifierValues: Record<string, number> = {};
  if (modifierValuesParam) {
    for (const pair of modifierValuesParam.split(',')) {
      const colonIdx = pair.indexOf(':');
      if (colonIdx > 0) {
        const id = pair.slice(0, colonIdx);
        const val = parseInt(pair.slice(colonIdx + 1), 10);
        if (!isNaN(val)) modifierValues[id] = val;
      }
    }
  }

  // Resolved modifiers for display: required, explicitly selected, or slider/incrementer
  // with a non-zero delta (i.e. moved off their default).
  const resolvedModifiers: PublicPackageModifier[] = pkg
    ? pkg.modifiers.filter((m) => {
        if (m.isRequired) return true;
        if (selectedModifierIds.includes(m.id)) return true;
        if (m.type === 'SLIDER' || m.type === 'INCREMENTER') {
          return computeModifierDelta(m, modifierValues) !== 0;
        }
        return false;
      })
    : [];

  // Total: base + correct delta for every modifier type
  const estimatedTotalCents =
    pkg != null
      ? (pkg.basePriceCents ?? 0) +
        pkg.modifiers.reduce((sum, m) => {
          if (m.isRequired) return sum + computeModifierDelta(m, modifierValues);
          if (selectedModifierIds.includes(m.id))
            return sum + computeModifierDelta(m, modifierValues);
          if (m.type === 'SLIDER' || m.type === 'INCREMENTER')
            return sum + computeModifierDelta(m, modifierValues);
          return sum;
        }, 0)
      : undefined;

  // During May 2026, booking requests get 10% off automatically.
  const discountActive = isSaleDiscountActive();
  const discountedTotalCents =
    discountActive && estimatedTotalCents != null ? applyDiscount(estimatedTotalCents) : undefined;

  const backHref =
    from === 'packages' || !pkg ? '/packages' : `/package-builder?package=${pkg.slug}`;
  const backLabel = from === 'packages' || !pkg ? '← Back to packages' : '← Back to builder';

  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back navigation */}
        <div className="mb-10">
          <Link
            href={backHref}
            className="text-sm text-ink-faint transition-colors duration-fast hover:text-ink"
          >
            {backLabel}
          </Link>
        </div>

        {/* Page header */}
        <header className="mb-12 max-w-xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Booking request
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Let&apos;s make it happen.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Fill in the details below and I&apos;ll be in touch to confirm availability and talk
            through the details.
          </p>
        </header>

        {/* Two-column layout on desktop */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
          {/* Form — left / full width on mobile */}
          <div className="min-w-0 flex-1">
            <BookingForm
              pkg={pkg ?? null}
              resolvedModifiers={resolvedModifiers}
              modifierValues={modifierValues}
              estimatedTotalCents={estimatedTotalCents}
              discountedTotalCents={discountedTotalCents}
              timeSlots={timeSlots}
              locationWindows={locationWindows}
            />
          </div>

          {/* Summary sidebar — desktop only */}
          {pkg && (
            <aside className="hidden lg:block lg:w-80 lg:flex-none lg:sticky lg:top-8">
              <SummaryPanel
                pkg={pkg}
                resolvedModifiers={resolvedModifiers}
                modifierValues={modifierValues}
                estimatedTotalCents={estimatedTotalCents}
                discountedTotalCents={discountedTotalCents}
              />
              <div className="mt-6 px-1">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
                  What happens next
                </p>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Once you submit, I&apos;ll review your request and be in touch to confirm the date
                  and sort out any details.
                </p>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

// ── Summary panel (desktop sidebar) ──────────────────────────────────────────

type SummaryPanelProps = {
  pkg: PublicPackage;
  resolvedModifiers: PublicPackageModifier[];
  modifierValues: Record<string, number>;
  estimatedTotalCents: number | undefined;
  discountedTotalCents: number | undefined;
};

const modifierDisplayValue = (
  m: PublicPackageModifier,
  values: Record<string, number>
): string | null => {
  if (m.type === 'SLIDER') {
    const cfg = m.config as SliderConfig | null;
    if (!cfg) return null;
    const v = values[m.id] ?? cfg.defaultValue;
    return `${v}${cfg.unit}`;
  }
  if (m.type === 'INCREMENTER') {
    const cfg = m.config as IncrementerConfig | null;
    if (!cfg) return null;
    const v = values[m.id] ?? cfg.defaultValue;
    return `${v}${cfg.unit ? ` ${cfg.unit}` : ''}`;
  }
  return null;
};

const SummaryPanel = ({
  pkg,
  resolvedModifiers,
  modifierValues,
  estimatedTotalCents,
  discountedTotalCents
}: SummaryPanelProps) => (
  <div className="rounded-card border border-border bg-sun px-6 py-6 shadow-warm-sm">
    <p className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-faint">
      Your selection
    </p>

    {/* Package name + base price */}
    <div className="mb-4 border-b border-border pb-4">
      <h2 className="text-base font-semibold text-ink">{pkg.name}</h2>
      {pkg.description && (
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{pkg.description}</p>
      )}
      {pkg.basePriceCents != null && (
        <p className="mt-2 text-xs text-ink-faint">
          Base:{' '}
          <span className="font-medium text-ink-muted">{formatPrice(pkg.basePriceCents)}</span>
        </p>
      )}
    </div>

    {/* Selected modifiers */}
    {resolvedModifiers.length > 0 && (
      <ul className="mb-4 space-y-2 border-b border-border pb-4">
        {resolvedModifiers.map((m) => {
          const delta = computeModifierDelta(m, modifierValues);
          const displayVal = modifierDisplayValue(m, modifierValues);
          return (
            <li key={m.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink-muted">
                {m.name}
                {displayVal && <span className="ml-1 text-xs text-ink-faint">({displayVal})</span>}
                {m.isRequired && !displayVal && (
                  <span className="ml-1 text-xs text-ink-faint">(included)</span>
                )}
              </span>
              {!m.isRequired && delta !== 0 && (
                <span className="flex-none text-xs tabular-nums text-ink-faint">
                  {delta > 0 ? '+' : '−'}
                  {formatPrice(Math.abs(delta))}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    )}

    {/* Estimated total */}
    {estimatedTotalCents != null && (
      <>
        {discountedTotalCents != null && (
          <div className="mb-3 flex items-center gap-2 rounded-card border border-accent/20 bg-accent/5 px-3 py-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-accent/80">
              {SALE.name}
            </span>
            <span className="text-xs text-accent">{SALE.discountLabel} applied</span>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink-muted">Estimated total</span>
          {discountedTotalCents != null ? (
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs tabular-nums text-ink-faint line-through">
                {formatPrice(estimatedTotalCents)}
              </span>
              <span className="text-xl font-semibold text-ink">
                {formatPrice(discountedTotalCents)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-semibold text-ink">
              {formatPrice(estimatedTotalCents)}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
          Final pricing confirmed after we connect.
        </p>
      </>
    )}
  </div>
);
