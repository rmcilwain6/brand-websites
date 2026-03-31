import Image from './components/img';
import Link from 'next/link';

import { fetchPublicGalleries, type GalleryListItem } from '@repo/core';

import { getServerEnv } from './lib/env';
import { HeroSection } from './components/hero-section';
import { Frame } from './components/frame';
import { Placard } from './components/placard';

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
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Block 1 — long, anchored left; orange wraps and sits right */}
          <p className="text-lg leading-relaxed text-ink-muted sm:text-xl">
            A lifetime of photography has changed how I see life, constantly filling me with a sense
            of gratitude for
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

// Cascading left offsets — desktop only, mobile stays flush.
const STAGGER_OFFSETS = ['sm:ml-0', 'sm:ml-[22%]', 'sm:ml-[44%]'] as const;

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  const offset = STAGGER_OFFSETS[index % STAGGER_OFFSETS.length];
  return (
    <div className={`max-w-lg ${offset}`}>
      <div aria-hidden className="mb-3 select-none font-serif text-5xl leading-none text-ink-faint">
        &ldquo;
      </div>
      <blockquote>
        <p className="text-base leading-relaxed text-ink-muted">{testimonial.quote}</p>
        <footer className="mt-4">
          <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
          <p className="mt-0.5 text-xs text-ink-faint">{testimonial.session}</p>
        </footer>
      </blockquote>
      {testimonial.gallerySlug && (
        <Link
          href={`/portfolio/${testimonial.gallerySlug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm text-ink-faint underline-offset-4 transition-colors duration-fast hover:text-ink hover:underline"
        >
          View gallery →
        </Link>
      )}
    </div>
  );
};
