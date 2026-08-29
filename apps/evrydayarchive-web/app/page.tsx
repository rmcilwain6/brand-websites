import type { Metadata } from 'next';
import Image from './components/img';
import Link from 'next/link';

import { fetchPublicGalleries, type GalleryListItem } from '@repo/core';

import { getServerEnv } from './lib/env';
import { HeroSection } from './components/hero-section';
import { Frame } from './components/frame';
import { Placard } from './components/placard';

export const metadata: Metadata = {
  alternates: { canonical: '/' }
};

export default async function HomePage() {
  const { ADMIN_API_BASE_URL } = getServerEnv();
  let galleries: GalleryListItem[] = [];

  try {
    galleries = await fetchPublicGalleries(ADMIN_API_BASE_URL, { next: { revalidate: 60 } });
  } catch {
    // Featured galleries are optional; degrade gracefully
  }

  const featured = galleries.filter((g) => g.featured);

  return (
    <main>
      {/* ── Section 1: Hero ───────────────────────────────────────────────── */}
      {/* Feature-flagged: ROLLING_HERO switches to the gallery wall variant */}
      <HeroSection />

      {/* ── Section 2: Photographer philosophy ─────────────────────────── */}
      <section className="group px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Row 1 — text (left half) + small portrait frame (right half) */}
          <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-3 sm:gap-10">
            <div className="mx-auto w-full max-w-6xl sm:col-span-2 sm:mx-0">
              {/* Block 1 — long, anchored left; orange wraps and sits right */}
              <p className="text-lg leading-relaxed text-ink-muted sm:text-xl">
                A lifetime of photography has changed how I see life, constantly filling me with a
                sense of gratitude for
                <span className="block text-right text-accent">moments big and small.</span>
              </p>

              {/* Block 2 — full width, right/left/right zigzag */}
              <div className="mt-10 text-lg leading-snug text-ink-muted sm:text-xl">
                {/* Mobile: lines 1+2 flow as one paragraph to avoid a hard break mid-thought */}
                <p className="sm:hidden">
                  Every click of the shutter is an intentional choice to document, remember, and
                </p>
                {/* Desktop: split into offset zigzag lines */}
                <p className="hidden sm:block sm:pl-36">
                  Every click of the shutter is an intentional choice
                </p>
                <p className="hidden sm:block sm:pl-[100px]">to document, remember, and</p>
                {/* Both: orange breaks right on mobile, offset left on desktop */}
                <p className="text-right text-accent sm:text-left sm:pl-40">
                  leave a gift for my future self.
                </p>
              </div>

              {/* Block 3 — right-aligned closer */}
              <p className="mt-10 text-lg leading-relaxed text-ink-muted sm:text-xl">
                In a life that moves this fast, I think we could all use more of that.
              </p>
            </div>

            {/* Small oval portrait — subtle, not the focal point of the section */}
            <div className="flex justify-center">
              <div className="w-full max-w-[220px]">
                <div className="aspect-[4/5] rounded-[48%] bg-surface p-1.5 shadow-frame">
                  <div className="relative h-full w-full overflow-hidden rounded-[50%] outline outline-1 -outline-offset-1 outline-border">
                    <Image
                      src="/images/about/about-page-17.webp"
                      alt="Reed McIlwain, smiling outdoors in Kamloops, BC"
                      fill
                      className="object-cover"
                      // objectPosition anchors the base crop; scale zooms in past that,
                      // and transformOrigin (kept in sync with objectPosition) picks the
                      // point the zoom holds still on. Bump scale to zoom further in;
                      // nudge the two percentages together to pan.
                      style={{
                        transform: 'scale(1.3)',
                        transformOrigin: '50% 25%'
                      }}
                      sizes="148px"
                    />
                  </div>
                </div>
                <div className="mt-3.5 flex justify-center">
                  <Placard title="Reed McIlwain" subtitle="Owner & Photographer" size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 — centered CTA, independent of the columns above.
              Hovering/focusing anywhere in the section reveals the arrow beneath it. */}
          <div className="mt-14 flex justify-center">
            <Link
              href="/about"
              className="group/cta -mx-6 -my-5 inline-flex flex-col items-center px-6 py-5 text-inherit no-underline sm:-mx-24 sm:px-24 lg:-mx-40 lg:px-40"
            >
              <span className="text-sm font-medium text-ink-muted transition-[color,transform] duration-fast group-hover:text-ink group-hover/cta:translate-x-2">
                Meet the photographer
              </span>
              <span className="mt-1.5 h-2.5 w-[150px] overflow-visible transition-transform duration-fast group-hover/cta:translate-x-2">
                <svg
                  viewBox="0 0 150 10"
                  preserveAspectRatio="none"
                  className="block h-full w-full overflow-visible"
                >
                  <path
                    d="M 5 5 L 138 5"
                    pathLength="1"
                    className="fill-none stroke-ink-muted opacity-0 [stroke-dasharray:1] [stroke-dashoffset:1] [stroke-linecap:round] [stroke-width:1.5] [transition:opacity_900ms_ease-out,stroke_120ms_ease-out] group-hover:opacity-100 group-hover:[stroke-dashoffset:0] group-hover:[transition:stroke-dashoffset_1400ms_cubic-bezier(0.16,1,0.3,1),opacity_300ms_ease-out,stroke_120ms_ease-out] group-focus-within:opacity-100 group-focus-within:[stroke-dashoffset:0] group-hover/cta:stroke-accent"
                  />
                  <path
                    d="M 138 1 L 146 5 L 138 9 Z"
                    className="fill-ink-muted opacity-0 [clip-path:inset(0_100%_0_0)] [transition:opacity_900ms_ease-out,clip-path_120ms_ease-out,fill_120ms_ease-out] group-hover:opacity-100 group-hover:[clip-path:inset(0_0_0_0)] group-hover:[transition:opacity_420ms_ease-out_850ms,clip-path_420ms_ease-out_850ms,fill_120ms_ease-out] group-focus-within:opacity-100 group-focus-within:[clip-path:inset(0_0_0_0)] group-focus-within:[transition:opacity_420ms_ease-out_850ms,clip-path_420ms_ease-out_850ms,fill_120ms_ease-out] group-hover/cta:fill-accent"
                  />
                </svg>
              </span>
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
                className="inline-flex items-center gap-1 text-sm text-ink-muted transition-[color,transform] duration-fast hover:translate-x-1.5 hover:text-ink"
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
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
              What people say
            </p>
            <h2 className="text-2xl font-semibold text-ink">Testimonials</h2>
          </div>

          <div className="space-y-16">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Pricing philosophy ───────────────────────────────── */}
      <section className="bg-sun px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Pricing
          </p>
          <h2 className="mb-6 text-2xl font-semibold text-ink">A starting point for everyone</h2>
          <p className="mb-8 text-base leading-relaxed text-ink-muted">
            Pricing is transparent and adjustable. Pick a package that&apos;s close, or use the
            builder to make it yours.
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

      {/* ── Section 6: Final CTA ─────────────────────────────────────────── */}
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
          <div className="inline-grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/inquire"
              className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Start a conversation
            </Link>
            <Link
              href="/process"
              className="rounded-card border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              See how it works
            </Link>
          </div>
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

type Testimonial = {
  quote: string;
  name: string;
  session: string;
  gallerySlug?: string;
};

// Handpicked snippets — swap in real quotes before launch.
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Working with Reed was honestly such a great experience. I'm not someone who usually feels comfortable in front of the camera, but he made the whole shoot feel so natural and easy from start to finish.",
    name: 'Julia',
    session: 'Julia & Benjamin',
    gallerySlug: 'julia-and-benjamin'
  },
  {
    quote:
      "10/10 highly recommend Reed for capturing the things that you love. He made the whole experience feel natural, comfortable, fun and never awkward (coming from an awkward human). Working with him was such an amazing experience and to say I'm obsessed with how the photos turned out is an understatement.",
    name: 'Jessica',
    session: 'Jess & Her Toyota',
    gallerySlug: 'jessica-and-her-toyota'
  },
  {
    quote:
      'Reed was amazing to work with. He is passionate, knowledgeable, and experienced, and he delivered great results for the UVic Renewable Energy Club. I would recommend him to anyone looking for personal or professional photography.',
    name: 'Ryan',
    session: 'UVic Renewable Energy Club',
    gallerySlug: 'urec'
  }
];

// Cascading left offsets — desktop only, mobile stays flush.
const STAGGER_OFFSETS = ['sm:ml-0', 'sm:ml-[22%]', 'sm:ml-[44%]'] as const;

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  const offset = STAGGER_OFFSETS[index % STAGGER_OFFSETS.length];
  return (
    <div className={`max-w-2xl ${offset}`}>
      <div aria-hidden className="mb-3 select-none font-serif text-5xl leading-none text-accent">
        &ldquo;
      </div>
      <blockquote>
        <p className="text-base leading-relaxed text-ink-muted">{testimonial.quote}</p>
        <footer className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{testimonial.session}</p>
          </div>
          <Link
            href={testimonial.gallerySlug ? `/portfolio/${testimonial.gallerySlug}` : '/portfolio'}
            className="inline-flex shrink-0 items-center gap-1 text-sm text-ink-muted transition-[color,transform] duration-fast hover:translate-x-1.5 hover:text-ink"
          >
            View gallery →
          </Link>
        </footer>
      </blockquote>
    </div>
  );
};
