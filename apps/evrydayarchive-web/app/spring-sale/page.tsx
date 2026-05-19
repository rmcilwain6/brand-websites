import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Spring Sale — 10% Off Any Session | Evryday Archive Co',
  description:
    '10% off any photography package for Kamloops sessions booked before May 31st. No code needed — pick your package and get started.',
  alternates: { canonical: '/spring-sale' }
};

const PACKAGES = [
  {
    label: 'For me',
    descriptor: 'Solo sessions, one on one.',
    slug: 'evryday'
  },
  {
    label: 'For me + some people',
    descriptor: 'Couples, friends, or the whole crew.',
    slug: 'together'
  },
  {
    label: 'For my work or business',
    descriptor: 'Commercial, product, or professional content.',
    slug: 'in-practice'
  },
  {
    label: 'For my event',
    descriptor: 'Gatherings, performances, community moments.',
    slug: 'as-it-unfolds'
  }
];

export default function SpringSalePage() {
  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative h-svh min-h-[560px] w-full overflow-hidden bg-sun">
        {/*
         * TODO: Replace this comment block with the hero image:
         * import Image from '../components/img';
         * <Image
         *   src="/images/spring-sale/hero.jpg"
         *   alt="Evryday Archive Co — spring sale"
         *   fill
         *   className="object-cover object-center"
         *   priority
         *   sizes="100vw"
         * />
         */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 px-6 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <h1 className="mb-3 max-w-lg text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            10% off any session. Book before May 31st.
          </h1>
          <p className="text-base text-white/75 sm:text-lg">
            Kamloops photography that fits your life — and your budget.
          </p>
        </div>
      </section>

      {/* ── Offer Block ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-lg leading-relaxed text-ink-muted sm:text-xl">
            <span className="font-medium text-ink">10% off any package</span>, for Kamloops sessions
            booked before May 31st. No code needed — pick the package that fits and the discount is
            reflected in the final price.
          </p>
        </div>
      </section>

      {/* ── Image Gallery ─────────────────────────────────────────────────────── */}
      {/*
       * TODO: Replace each placeholder div with:
       * <div className="relative aspect-[x/y] overflow-hidden rounded-sm">
       *   <Image src="/images/spring-sale/gallery-N.jpg" alt="..." fill className="object-cover" sizes="..." />
       * </div>
       *
       * Suggested sizes attributes:
       *   - Tall portrait (col-span-1):  sizes="(min-width: 640px) 50vw, 100vw"
       *   - Wide landscape (col-span-2): sizes="100vw"
       *
       * Drop images into: public/images/spring-sale/
       */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-sun" />
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-mat-linen" />
            <div className="relative aspect-[3/2] overflow-hidden rounded-sm bg-sun sm:col-span-2" />
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-mat-linen" />
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-sun" />
          </div>
        </div>
      </section>

      {/* ── Package Selector ──────────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-semibold text-ink sm:mb-10 sm:text-3xl">
            Find the right fit
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.slug}
                className="flex flex-col justify-between rounded-card border border-border bg-surface p-5"
              >
                <div className="mb-6">
                  <p className="mb-1 text-base font-semibold text-ink">{pkg.label}</p>
                  <p className="text-sm leading-relaxed text-ink-muted">{pkg.descriptor}</p>
                </div>
                <Link
                  href={`/package-builder?package=${pkg.slug}`}
                  className="block rounded-card bg-accent px-4 py-3 text-center text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Build this package
                </Link>
              </div>
            ))}
          </div>

          {/* Portfolio nudge */}
          <p className="mt-10 text-sm text-ink-muted">
            Not sure yet?{' '}
            <Link
              href="/portfolio"
              className="text-ink underline underline-offset-2 transition-opacity duration-fast hover:opacity-60"
            >
              Take a look at the work first.
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
