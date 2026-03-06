import Link from 'next/link';

import { fetchPublicPackages, type PublicPackage } from '@repo/core';

import { getServerEnv } from '../lib/env';

export const dynamic = 'force-dynamic';

const PackagesPage = async () => {
  const { ADMIN_API_BASE_URL } = getServerEnv();
  let packages: PublicPackage[] = [];

  try {
    packages = await fetchPublicPackages(ADMIN_API_BASE_URL, { next: { revalidate: 60 } });
  } catch {
    // Graceful degradation — page still renders without packages
  }

  return (
    <main>
      {/* ── Section 1: Intro / philosophy ────────────────────────────────── */}
      <section className="px-4 pb-16 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Investment
          </p>
          <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            The Curator&apos;s Notes
          </h1>
          <p className="mb-4 text-base leading-relaxed text-ink-muted">
            Sessions are scoped around what you actually need — not bundled with extras that
            don&apos;t serve you. Every package below is a starting point, not a ceiling.
          </p>
          <p className="text-base leading-relaxed text-ink-muted">
            Don&apos;t see your situation here?{' '}
            <Link
              href="/inquire"
              className="font-medium text-ink underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
            >
              Reach out anyway
            </Link>
            . Custom sessions are always welcome.
          </p>
        </div>
      </section>

      {/* ── Section 2: Package list ───────────────────────────────────────── */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {packages.length === 0 ? (
            <div className="rounded-card border border-border px-8 py-16 text-center">
              <p className="mb-6 text-base leading-relaxed text-ink-muted">
                Packages are being finalized — check back soon.
              </p>
              <Link
                href="/inquire"
                className="text-sm font-medium text-ink underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
              >
                In the meantime, reach out directly →
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Section 3: End CTA ────────────────────────────────────────────── */}
      <section className="bg-sun px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Still unsure?
          </p>
          <h2 className="mb-4 text-2xl font-semibold text-ink">
            Custom situations are always welcome.
          </h2>
          <p className="mb-8 text-base leading-relaxed text-ink-muted">
            If nothing above feels like the right fit, tell me what you have in mind. We&apos;ll
            figure it out together.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/inquire"
              className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Inquire
            </Link>
            <Link
              href="/package-builder"
              className="rounded-card border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Build your own
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PackagesPage;

// ── Sub-components ──────────────────────────────────────────────────────────

const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

const PackageCard = ({ pkg }: { pkg: PublicPackage }) => (
  <article className="rounded-card border border-border bg-canvas p-8 shadow-warm-sm">
    {/* Header */}
    <header className="mb-6">
      <h2 className="text-2xl font-semibold leading-snug text-ink">{pkg.name}</h2>
      {pkg.description && (
        <p className="mt-2 text-base leading-relaxed text-ink-muted">{pkg.description}</p>
      )}
      {pkg.basePriceCents != null && (
        <p className="mt-3 text-sm font-medium text-ink-faint">
          Starting at <span className="text-ink">{formatPrice(pkg.basePriceCents)}</span>
        </p>
      )}
    </header>

    {/* Modifiers */}
    {pkg.modifiers.length > 0 && (
      <div className="mb-6 border-t border-border pt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
          Add-ons available
        </p>
        <ul className="space-y-2">
          {pkg.modifiers.map((m) => (
            <li key={m.id} className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-ink-muted">
                {m.name}
                {m.isRequired && <span className="ml-2 text-xs text-ink-faint">(included)</span>}
                {m.description && (
                  <span className="ml-1 text-xs text-ink-faint">— {m.description}</span>
                )}
              </span>
              {m.priceDeltaCents != null && !m.isRequired && (
                <span className="flex-none text-xs text-ink-faint">
                  {m.priceDeltaCents >= 0 ? '+' : ''}
                  {formatPrice(m.priceDeltaCents)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* CTAs */}
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/inquire?package=${pkg.slug}`}
        className="rounded-card bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        Inquire about this
      </Link>
      <Link
        href={`/package-builder?package=${pkg.slug}`}
        className="rounded-card border border-border px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        Open in builder
      </Link>
    </div>
  </article>
);
