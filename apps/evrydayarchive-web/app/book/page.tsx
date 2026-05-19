import type { Metadata } from 'next';
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
import { isSaleAnnouncementActive, isSaleAutoOptIn } from '../lib/sale';
import { BookingForm } from './booking-form';

export const metadata: Metadata = {
  title: 'Book a Session | Evryday Archive Co',
  description: 'Request your photography session with Evryday Archive Co.',
  robots: { index: false },
  alternates: { canonical: '/book' }
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    package?: string;
    modifiers?: string;
    modifierValues?: string;
    from?: string;
    sale?: string;
  }>;
};

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
    from,
    sale
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

  // Spring Sale: opt-in via the package builder (sale=1 param), or auto-enabled during
  // April and May. Date validation (must be a May date) happens client-side in BookingForm.
  const springSale = (sale === '1' || isSaleAutoOptIn()) && isSaleAnnouncementActive();

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

        {/* Two-column layout — BookingForm owns both the form and the reactive sidebar */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
          <BookingForm
            pkg={pkg ?? null}
            resolvedModifiers={resolvedModifiers}
            modifierValues={modifierValues}
            estimatedTotalCents={estimatedTotalCents}
            springSale={springSale}
            timeSlots={timeSlots}
            locationWindows={locationWindows}
          />
        </div>
      </div>
    </main>
  );
}
