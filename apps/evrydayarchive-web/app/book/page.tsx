import type { Metadata } from 'next';
import Link from 'next/link';

import {
  activeModifiers,
  estimateTotalCents,
  fetchPublicAvailability,
  fetchPublicSchedule,
  fetchPublicPackages,
  type LocationWindow,
  type PublicPackage,
  type TimeSlot
} from '@repo/core';

import { getServerEnv } from '../lib/env';
import { BookingForm } from './booking-form';
import type { BookingSelection } from './selection-summary';

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
  }>;
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

  const modifierSelection = { selectedIds: selectedModifierIds, values: modifierValues };
  const selection: BookingSelection | null = pkg
    ? {
        pkg,
        modifiers: activeModifiers(pkg.modifiers, modifierSelection),
        modifierValues,
        estimatedTotalCents: estimateTotalCents(
          pkg.basePriceCents,
          pkg.modifiers,
          modifierSelection
        )
      }
    : null;

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
            Three short steps. Nothing is booked until I&apos;ve confirmed the details with you.
          </p>
        </header>

        {/* Two-column layout — BookingForm owns both the form and the reactive sidebar */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
          <BookingForm
            selection={selection}
            timeSlots={timeSlots}
            locationWindows={locationWindows}
          />
        </div>
      </div>
    </main>
  );
}
