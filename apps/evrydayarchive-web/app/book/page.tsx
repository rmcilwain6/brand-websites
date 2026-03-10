import Link from 'next/link';

import { fetchPublicPackages, type PublicPackage, type PublicPackageModifier } from '@repo/core';

import { getServerEnv } from '../lib/env';
import { BookingForm } from './booking-form';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ package?: string; modifiers?: string }>;
};

const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

export default async function BookPage({ searchParams }: Props) {
  const { package: packageSlug, modifiers: modifiersParam } = await searchParams;
  const { ADMIN_API_BASE_URL } = getServerEnv();

  let packages: PublicPackage[] = [];
  try {
    packages = await fetchPublicPackages(ADMIN_API_BASE_URL, { next: { revalidate: 60 } });
  } catch {
    // Graceful degradation — form still works without package context
  }

  // Resolve package by slug
  const pkg = packageSlug ? packages.find((p) => p.slug === packageSlug) : undefined;

  // Resolve selected modifier IDs from the comma-separated query param
  const selectedModifierIds = modifiersParam ? modifiersParam.split(',').filter(Boolean) : [];

  // Keep required modifiers always, and optional ones only if explicitly selected
  const resolvedModifiers: PublicPackageModifier[] = pkg
    ? pkg.modifiers.filter((m) => m.isRequired || selectedModifierIds.includes(m.id))
    : [];

  // Compute estimated total
  const estimatedTotalCents =
    pkg != null
      ? (pkg.basePriceCents ?? 0) +
        resolvedModifiers.reduce((sum, m) => sum + (m.priceDeltaCents ?? 0), 0)
      : undefined;

  const backHref = pkg ? `/package-builder?package=${pkg.slug}` : '/packages';
  const backLabel = pkg ? '← Back to builder' : '← Back to packages';

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
            Fill in the details below and I&apos;ll get back to you within 48 hours to confirm
            availability and talk through the rest.
          </p>
        </header>

        {/* Two-column layout on desktop */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
          {/* Form — left / full width on mobile */}
          <div className="min-w-0 flex-1">
            <BookingForm
              pkg={pkg ?? null}
              resolvedModifiers={resolvedModifiers}
              estimatedTotalCents={estimatedTotalCents}
            />
          </div>

          {/* Summary sidebar — desktop only */}
          {pkg && (
            <aside className="hidden lg:block lg:w-80 lg:flex-none lg:sticky lg:top-8">
              <SummaryPanel
                pkg={pkg}
                resolvedModifiers={resolvedModifiers}
                estimatedTotalCents={estimatedTotalCents}
              />
              <div className="mt-6 px-1">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
                  What happens next
                </p>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Once you submit, I&apos;ll review your request and reach out within 48 hours to
                  confirm the date and sort out any details.
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
  estimatedTotalCents: number | undefined;
};

const SummaryPanel = ({ pkg, resolvedModifiers, estimatedTotalCents }: SummaryPanelProps) => (
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
        {resolvedModifiers.map((m) => (
          <li key={m.id} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-ink-muted">
              {m.name}
              {m.isRequired && <span className="ml-1 text-xs text-ink-faint">(included)</span>}
            </span>
            {m.priceDeltaCents != null && !m.isRequired && (
              <span className="flex-none text-xs tabular-nums text-ink-faint">
                +{formatPrice(m.priceDeltaCents)}
              </span>
            )}
          </li>
        ))}
      </ul>
    )}

    {/* Estimated total */}
    {estimatedTotalCents != null && (
      <>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink-muted">Estimated total</span>
          <span className="text-xl font-semibold text-ink">{formatPrice(estimatedTotalCents)}</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
          Final pricing confirmed after we connect.
        </p>
      </>
    )}
  </div>
);
