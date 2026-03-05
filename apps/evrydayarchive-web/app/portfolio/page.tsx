import Image from 'next/image';
import Link from 'next/link';

import { fetchPublicGalleries, type GalleryListItem } from '@repo/core';

import { getServerEnv } from '../lib/env';
import { Frame } from '../components/frame';
import { Placard } from '../components/placard';

export const dynamic = 'force-dynamic';

const PortfolioPage = async () => {
  const { ADMIN_API_BASE_URL } = getServerEnv();
  let galleries: GalleryListItem[] = [];

  try {
    galleries = await fetchPublicGalleries(ADMIN_API_BASE_URL, { next: { revalidate: 60 } });
  } catch (error) {
    if (error instanceof Error) {
      console.warn('[portfolio] Failed to load galleries.', error.message);
    }
  }

  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <header className="mb-14">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
            The archive
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Portfolio</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            A collection of sessions documented with intention. Browse the exhibits below.
          </p>
        </header>

        {/* Gallery wall list */}
        {galleries.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-ink-faint">No published galleries yet — check back soon.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {galleries.map((gallery, index) => (
              <GalleryRow key={gallery.id} gallery={gallery} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default PortfolioPage;

// ── Sub-components ─────────────────────────────────────────────────────────

const GalleryRow = ({ gallery, index }: { gallery: GalleryListItem; index: number }) => {
  // Alternate subtle rotation direction for visual rhythm
  const rotateDeg = index % 2 === 0 ? -0.6 : 0.5;

  return (
    <article className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
      {/* Framed cover */}
      <div className="w-full sm:w-72 sm:flex-none">
        <Link href={`/portfolio/${gallery.slug}`} className="group block">
          <Frame rotateDeg={rotateDeg}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-sun">
              {gallery.coverImage ? (
                <Image
                  src={gallery.coverImage.src}
                  alt={gallery.coverImage.alt}
                  fill
                  className="object-cover transition-transform duration-slow group-hover:scale-[1.03]"
                  sizes="(min-width: 640px) 288px, 100vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs text-ink-faint">No cover image</span>
                </div>
              )}
            </div>
          </Frame>
        </Link>
      </div>

      {/* Placard + CTA */}
      <div className="flex flex-1 flex-col justify-center gap-5">
        <Placard
          title={gallery.title}
          subtitle={gallery.location ?? undefined}
          meta={
            gallery.imageCount > 0
              ? `${gallery.imageCount} image${gallery.imageCount === 1 ? '' : 's'}`
              : undefined
          }
        />

        <Link
          href={`/portfolio/${gallery.slug}`}
          className="self-start rounded-card border border-border px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          View gallery →
        </Link>
      </div>
    </article>
  );
};
