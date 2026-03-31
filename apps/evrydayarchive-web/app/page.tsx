import Image from 'next/image';
import Link from 'next/link';

import {
  fetchPublicGalleries,
  fetchPublicReviews,
  type GalleryListItem,
  type PublicReview
} from '@repo/core';

import { getServerEnv } from './lib/env';
import { HeroSection } from './components/hero-section';
import { Frame } from './components/frame';
import { Placard } from './components/placard';
import { FilingCabinet } from './components/filing-cabinet';

export default async function HomePage() {
  const { ADMIN_API_BASE_URL } = getServerEnv();
  let galleries: GalleryListItem[] = [];
  let reviews: PublicReview[] = [];

  try {
    galleries = await fetchPublicGalleries(ADMIN_API_BASE_URL, { next: { revalidate: 60 } });
  } catch {
    // Featured galleries are optional; degrade gracefully
  }

  try {
    reviews = await fetchPublicReviews(ADMIN_API_BASE_URL, { next: { revalidate: 60 } });
  } catch {
    // Reviews are optional; degrade gracefully
  }

  const featured = galleries.slice(0, 4);

  return (
    <main>
      {/* ── Section 1: Hero ───────────────────────────────────────────────── */}
      {/* Feature-flagged: ROLLING_HERO switches to the gallery wall variant */}
      <HeroSection />

      {/* ── Section 2: Photographer philosophy ─────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Block 1 — long, anchored left; orange wraps and sits right */}
          <p className="text-lg leading-relaxed text-ink-muted sm:text-xl">
            A lifetime of photography has changed how I see life, constantly filling me with a sense
            of gratitude for
            <span className="block text-right text-accent">moments big and small.</span>
          </p>

          {/* Block 2 — compact two-line block, offset inward from left */}
          <p className="ml-8 mt-10 max-w-xs text-lg leading-relaxed text-ink-muted sm:ml-16 sm:text-xl">
            Every click of the shutter is an intentional choice to document, remember, and{' '}
            <span className="text-accent">leave a gift for my future self</span>.
          </p>

          {/* Block 3 — right-aligned closer */}
          <p className="mt-10 text-right text-lg leading-relaxed text-ink-muted sm:text-xl">
            In a life that moves this fast, I think we could all use more of that.
          </p>

          <div className="mt-8 flex justify-end">
            <Link
              href="/about"
              className="text-sm text-ink-muted transition-colors duration-fast hover:text-ink hover:underline"
            >
              Meet the photographer →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 3: Featured galleries carousel ───────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between px-4 sm:px-6 lg:px-8">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
                  The archive
                </p>
                <h2 className="text-2xl font-semibold text-ink">Featured galleries</h2>
              </div>
              <Link
                href="/portfolio"
                className="text-sm text-ink-muted transition-colors duration-fast hover:text-ink"
              >
                View all →
              </Link>
            </div>

            {/* Horizontal scroll carousel — CSS scroll-snap, no JS needed */}
            <div className="flex gap-5 overflow-x-auto scroll-smooth px-4 pb-6 scrollbar-none snap-x snap-mandatory sm:px-6 lg:px-8">
              {featured.map((gallery) => (
                <GalleryCard key={gallery.id} gallery={gallery} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 4: Social proof ──────────────────────────────────────── */}
      {(reviews.length > 0 || FALLBACK_TESTIMONIALS.length > 0) && (
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10">
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
                What people say
              </p>
              <h2 className="text-2xl font-semibold text-ink">Reviews</h2>
            </div>

            {reviews.length > 0 ? (
              <FilingCabinet reviews={reviews} />
            ) : (
              <div className="space-y-12 max-w-3xl">
                {FALLBACK_TESTIMONIALS.map((t, i) => (
                  <blockquote key={i}>
                    <p className="text-base leading-relaxed text-ink-muted">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="mt-3 text-sm">
                      <span className="font-medium text-ink">{t.name}</span>
                      <span className="text-ink-faint"> · {t.session}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Section 5: Pricing philosophy ───────────────────────────────── */}
      <section className="bg-sun px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Investment
          </p>
          <h2 className="mb-6 text-2xl font-semibold text-ink">Straightforward pricing</h2>
          <p className="mb-8 text-base leading-relaxed text-ink-muted">
            Photography shouldn&apos;t require a negotiation. Sessions are scoped clearly — you know
            exactly what&apos;s included before any commitment. If you&apos;re not sure which option
            fits, reach out anyway.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/packages"
              className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Explore packages
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

      {/* ── Section 6: Where we operate ─────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Placard
            title="Kamloops & British Columbia"
            subtitle="Available for local and travel sessions across Canada"
            meta="Where we work"
          />
        </div>
      </section>

      {/* ── Section 7: Final CTA ─────────────────────────────────────────── */}
      <section className="px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            No pressure.
            <br />
            Tell me what you&apos;re thinking.
          </h2>
          <p className="mb-10 text-base leading-relaxed text-ink-muted">
            Whether you have a session in mind or just want to see if it&apos;s a fit — reach out.
            No pressure, no commitment.
          </p>
          <Link
            href="/inquire"
            className="inline-block rounded-card bg-accent px-8 py-4 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Start a conversation
          </Link>
        </div>
      </section>
    </main>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

const GalleryCard = ({ gallery }: { gallery: GalleryListItem }) => {
  return (
    <Link
      href={`/portfolio/${gallery.slug}`}
      className="group flex-none snap-start"
      style={{ width: 'min(288px, 80vw)' }}
    >
      <Frame
        placard={{ title: gallery.title, subtitle: gallery.location ?? undefined }}
        placardPosition="bottom-left"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-sun">
          {gallery.coverImage ? (
            <Image
              src={gallery.coverImage.src}
              alt={gallery.coverImage.alt}
              fill
              className="object-cover transition-transform duration-slow group-hover:scale-[1.03]"
              sizes="(min-width: 640px) 288px, 80vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs text-ink-faint">No cover</span>
            </div>
          )}
        </div>
      </Frame>
    </Link>
  );
};

// ── Static content ──────────────────────────────────────────────────────────

const FALLBACK_TESTIMONIALS = [
  {
    quote:
      "Working with Evryday Archive felt effortless. The photos captured moments I'd forgotten I wanted to remember.",
    name: 'Sarah M.',
    session: 'Family session'
  },
  {
    quote:
      "I've never felt comfortable in front of a camera. These photos changed that. Natural, warm, exactly what I hoped for.",
    name: 'James T.',
    session: 'Portrait session'
  },
  {
    quote:
      'The process was clear from the start. No surprises, and the results were exactly what we discussed.',
    name: 'Mara & David',
    session: 'Couple session'
  }
];
