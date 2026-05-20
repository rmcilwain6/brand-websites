import type { Metadata } from 'next';
import Link from 'next/link';
import Image from '../components/img';

export const metadata: Metadata = {
  title: 'Spring Sale — 10% Off Any Session | Evryday Archive Co',
  description:
    '10% off any photography package for Kamloops sessions booked before May 31st. No code needed — pick your package and get started.',
  alternates: { canonical: '/spring-sale' }
};

const PACKAGES = [
  {
    label: 'For you',
    descriptor: 'Solo sessions, one on one.',
    slug: 'evryday-package',
    src: 'https://res.cloudinary.com/dlib7syhc/image/upload/v1774917240/galleries/urec/wj3dtqh9ewd9qgmjorr7.jpg',
    alt: 'Ruben with the UVic Renewable Energy Club, posing for a headshot'
  },
  {
    label: 'For you + your people',
    descriptor: 'Couples, friends, or the whole crew.',
    slug: 'together',
    src: 'https://res.cloudinary.com/dlib7syhc/image/upload/v1774917667/galleries/nicole-and-nikki/zbzcvrkz66icb1hnyoxl.jpg',
    alt: 'Nicole & Nikki on a bench near the Victoria Harbour'
  },
  {
    label: 'For your work or business',
    descriptor: 'Commercial, product, or professional content.',
    slug: 'in-practice',
    src: 'https://res.cloudinary.com/dlib7syhc/image/upload/v1774051454/galleries/science-of-wine/dg3geuvdp8vqtixklf1q.jpg',
    alt: 'Wine is poured during the Science of Wine event at the Big Little Science Centre.'
  },
  {
    label: 'For your event',
    descriptor: 'Gatherings, performances, community moments.',
    slug: 'as-it-unfolds',
    src: 'https://res.cloudinary.com/dlib7syhc/image/upload/v1774919288/galleries/valleyview-alumni-game/e4jxdumk5wl0gjeifbic.jpg',
    alt: 'A player takes a jump shot after driving to the hoop during the 2025 Valleyview Alumni Basketball Game.'
  }
];

export default function SpringSalePage() {
  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      {/*
       * Mobile: full-bleed image, text overlaid at bottom-left.
       *   - No top header; fixed bottom nav (h-16) + sale bar (h-7) = 92px chrome.
       *   - min-h-[100svh], pb-28 (112px) keeps text clear of the bottom chrome.
       * md–lg: sticky top header (h-16); no bottom chrome.
       *   - min-h-[calc(100svh-4rem)] fills exactly the viewport below the nav.
       * lg+: two-column split — text left, image right.
       *   - min-h-0, image column sets height via lg:min-h-[640px].
       */}
      <section className="relative overflow-hidden bg-black lg:bg-canvas lg:flex">
        <div className="relative z-10 flex min-h-[100svh] items-end md:min-h-[calc(100svh-4rem)] lg:min-h-0 lg:w-1/2 lg:shrink-0 lg:items-center">
          <div className="px-6 pb-28 sm:px-10 md:pb-16 lg:px-16 lg:py-24">
            <h1 className="mb-3 max-w-lg text-3xl font-semibold leading-tight text-white sm:text-4xl lg:max-w-none lg:text-5xl lg:text-ink">
              10% off any session. <br />
              Book before May 31st.
            </h1>
            <p className="text-base text-white/75 sm:text-lg lg:text-ink-muted">
              TODO COME UP WITH SOMETHING
            </p>
          </div>
        </div>

        <div className="absolute inset-0 lg:relative lg:inset-auto lg:flex-1 lg:min-h-[640px]">
          <Image
            src="https://res.cloudinary.com/dlib7syhc/image/upload/v1774848987/galleries/jessica-and-her-toyota/mlb50mmgpcp9zonfebn1.jpg"
            alt="Evryday Archive Co — spring sale"
            fill
            className="object-cover object-[30%_50%] lg:object-center"
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent lg:hidden" />
        </div>
      </section>

      {/* ── Offer Block ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-lg leading-relaxed text-ink-muted sm:text-xl">
            <span className="font-medium text-ink">10% off any package</span>, for Kamloops sessions
            booked before May 31st. No code needed. Pick the package that fits and the discount is
            reflected in the final price.
          </p>
        </div>
      </section>

      {/* ── Package Cards ─────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-2xl font-semibold text-ink sm:mb-10 sm:text-3xl">
            Find the right fit
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.slug}
                className="flex flex-col overflow-hidden rounded-card border border-border bg-surface"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={pkg.src}
                    alt={pkg.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="mb-5">
                    <p className="mb-1 text-base font-semibold text-ink">{pkg.label}</p>
                    <p className="text-sm leading-relaxed text-ink-muted">{pkg.descriptor}</p>
                  </div>
                  <Link
                    href={`/package-builder?package=${pkg.slug}`}
                    className="block rounded-card bg-accent px-4 py-3 text-center text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    Start here
                  </Link>
                </div>
              </div>
            ))}
          </div>

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
