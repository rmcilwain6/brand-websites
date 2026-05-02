import type { Metadata } from 'next';
import Link from 'next/link';

import { fetchPublicPackages, type PublicPackage } from '@repo/core';

import { getServerEnv } from '../lib/env';
import { Questionnaire } from './questionnaire';

export const metadata: Metadata = {
  title: 'Get Started | Evryday Archive Co',
  description:
    'Tell us about yourself and get a tailored session recommendation. Start planning your Evryday Archive photography session today.'
};

export const dynamic = 'force-dynamic';

const InquirePage = async () => {
  const { ADMIN_API_BASE_URL } = getServerEnv();
  let packages: PublicPackage[] = [];

  try {
    packages = await fetchPublicPackages(ADMIN_API_BASE_URL, { next: { revalidate: 60 } });
  } catch {
    // Graceful degradation — Questionnaire falls back to hardcoded Evryday package
  }

  return (
    <main>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <section className="px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Let&apos;s find the right fit
          </p>
          <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Tell me about your idea.
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-ink-muted">
            Answer a few simple questions and I&apos;ll point you toward what makes the most sense
            for your situation. Or scroll down and browse the options directly.
          </p>
        </div>
      </section>

      {/* ── Section 1: Guided questionnaire ─────────────────────────────────── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Questionnaire packages={packages} />
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-border" />
      </div>

      {/* ── Section 2: Packages at a glance ─────────────────────────────────── */}
      <section id="packages-at-a-glance" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <header className="mb-10">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
              Or pick a starting point
            </p>
            <h2 className="text-2xl font-semibold leading-snug text-ink">Packages at a glance</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Know what you want?{' '}
              <Link
                href="/packages"
                className="font-medium text-ink underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
              >
                See full package details
              </Link>{' '}
              or select one below to get started.
            </p>
          </header>

          {packages.length === 0 ? (
            <div className="rounded-card border border-border px-8 py-12 text-center">
              <p className="mb-4 text-base leading-relaxed text-ink-muted">
                Packages are being finalized — check back soon.
              </p>
              <Link
                href="/contact"
                className="text-sm font-medium text-ink underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
              >
                Reach out directly →
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {packages.map((pkg) => (
                <GlanceCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default InquirePage;

// ── Sub-components ──────────────────────────────────────────────────────────

const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

const GlanceCard = ({ pkg }: { pkg: PublicPackage }) => (
  <article className="rounded-card border border-border bg-canvas px-6 py-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-ink">{pkg.name}</h3>
        {pkg.description && (
          <p className="mt-1 text-sm leading-relaxed text-ink-muted line-clamp-2">
            {pkg.description}
          </p>
        )}
        {pkg.basePriceCents != null && (
          <p className="mt-2 text-xs text-ink-faint">
            Starting at{' '}
            <span className="font-medium text-ink-muted">{formatPrice(pkg.basePriceCents)}</span>
          </p>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-none flex-wrap gap-2 sm:flex-col sm:items-end">
        <Link
          href={`/book?package=${pkg.slug}`}
          className="rounded-card bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Inquire about this
        </Link>
        <Link
          href={`/package-builder?package=${pkg.slug}`}
          className="rounded-card border border-border px-4 py-2 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Customize
        </Link>
      </div>
    </div>
  </article>
);
