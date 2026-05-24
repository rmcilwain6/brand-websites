import type { Metadata } from 'next';
import Link from 'next/link';

import { fetchPublicPackages, type PublicPackage } from '@repo/core';

import { getServerEnv } from '../lib/env';

export const metadata: Metadata = {
  title: 'Photography Packages | Evryday Archive Co',
  description:
    'Transparent session pricing with no hidden fees. Browse photography packages and find the right fit for your budget and occasion.',
  alternates: { canonical: '/packages' }
};

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
            Packages
          </p>
          <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Starting points, not ceilings.
          </h1>
          <p className="mb-4 text-base leading-relaxed text-ink-muted">
            Each package below is a baseline — a sensible default for the most common situations.
            Adjust the session length, swap in add-ons, or strip it back. The builder is there to
            make it yours.
          </p>
          <p className="text-base leading-relaxed text-ink-muted">
            Nothing quite fits?{' '}
            <Link
              href="/contact"
              className="font-medium text-ink underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
            >
              Get in touch
            </Link>{' '}
            and we&apos;ll figure something out. <br />
            Have questions about pricing or delivery?{' '}
            <Link
              href="/faq"
              className="font-medium text-ink underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
            >
              Check the FAQ
            </Link>
            .
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
                className="text-sm font-medium text-ink underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
              >
                In the meantime, reach out directly →
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {[...packages]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((pkg) => (
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
            Something else in mind?
          </p>
          <h2 className="mb-4 text-2xl font-semibold text-ink">
            Don&apos;t see what you&apos;re looking for?
          </h2>
          <p className="mb-8 text-base leading-relaxed text-ink-muted">
            If none of these feel right, just reach out. Odd situations, tight budgets, unusual
            ideas — all welcome.
          </p>
          <Link
            href="/contact"
            className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Get in touch
          </Link>
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

const PackageCard = ({ pkg }: { pkg: PublicPackage }) => {
  const hasOptionalModifiers = pkg.modifiers.some((m) => !m.isRequired);

  return (
    <article className="rounded-card border border-border bg-canvas p-8 shadow-warm-sm">
      {/* Header */}
      <header className="mb-6">
        <h2 className="text-2xl font-semibold leading-snug text-ink">{pkg.name}</h2>
        {pkg.description && (
          <p className="mt-2 text-base leading-relaxed text-ink-muted">{pkg.description}</p>
        )}
        {pkg.basePriceCents != null && (
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <p className="text-sm font-medium text-ink-faint">
              Base price <span className="text-ink">{formatPrice(pkg.basePriceCents)}</span>
            </p>
            {hasOptionalModifiers && (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-ink-faint">
                Adjustable
              </span>
            )}
          </div>
        )}
      </header>

      {/* Deliverables */}
      {pkg.deliverables.length > 0 && (
        <div className="mb-6 border-t border-border pt-5">
          <ul className="space-y-2">
            {pkg.deliverables.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/book?package=${pkg.slug}&from=packages`}
          className="rounded-card bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Book this package
        </Link>
        <Link
          href={`/package-builder?package=${pkg.slug}`}
          className="rounded-card border border-border px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Customize package
        </Link>
      </div>
    </article>
  );
};

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    className="mt-0.5 shrink-0 text-accent"
  >
    <path
      d="M2.5 7l3 3 6-6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
