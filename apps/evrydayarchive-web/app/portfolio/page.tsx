import Image from '../components/img';
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
        <header className="mb-16">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
            The archive
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Current Exhibits
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            Each gallery below is a collection of work from a single session. Choose one to enter.
          </p>
        </header>

        {/* Gallery list */}
        {galleries.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-ink-faint">No published galleries yet — check back soon.</p>
          </div>
        ) : (
          <div>
            {galleries.map((gallery, index) => (
              <GalleryEntry key={gallery.id} gallery={gallery} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default PortfolioPage;

// ── Sub-components ─────────────────────────────────────────────────────────

const GalleryEntry = ({ gallery, index }: { gallery: GalleryListItem; index: number }) => {
  const catalogNum = String(index + 1).padStart(2, '0');
  // Alternate: even index → image left, odd → image right
  const imageRight = index % 2 !== 0;

  const aspectRatio =
    gallery.coverImage?.width && gallery.coverImage?.height
      ? `${gallery.coverImage.width} / ${gallery.coverImage.height}`
      : '4 / 3';

  return (
    <>
      {/* Threshold divider — sits before every entry, carries the catalog number */}
      <div className="relative flex items-center py-10">
        <div className="flex-1 border-t border-border" />
        <span className="mx-4 font-mono text-base font-semibold tracking-widest text-accent">
          {catalogNum}
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      <article
        className={`flex flex-col gap-8 sm:gap-12 ${imageRight ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}
      >
        {/* Framed cover — sits at the ~1/3 mark on desktop */}
        <div className="w-full sm:w-1/3 sm:flex-none">
          <Link href={`/portfolio/${gallery.slug}`} className="group block">
            <Frame>
              <div
                className="relative w-full overflow-hidden rounded-sm bg-sun"
                style={{ aspectRatio }}
              >
                {gallery.coverImage ? (
                  <Image
                    src={gallery.coverImage.src}
                    alt={gallery.coverImage.alt}
                    fill
                    className="object-cover transition-transform duration-slow group-hover:scale-[1.02]"
                    sizes="(min-width: 640px) 33vw, 100vw"
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

        {/* Metadata + wayfinding */}
        <div
          className={`flex flex-1 flex-col items-start gap-5 sm:gap-0 sm:justify-between ${imageRight ? 'sm:items-end' : ''}`}
        >
          {/* Top group: gallery number + placard */}
          <div className={`flex flex-col gap-4 ${imageRight ? 'sm:items-end' : 'items-start'}`}>
            <p
              className={`font-mono text-xs font-medium uppercase tracking-widest text-ink-faint ${imageRight ? 'sm:text-right' : ''}`}
            >
              Gallery {catalogNum}
            </p>

            <Placard
              title={gallery.title}
              subtitle={gallery.location ?? undefined}
              meta={
                gallery.imageCount > 0
                  ? `${gallery.imageCount} image${gallery.imageCount === 1 ? '' : 's'}`
                  : undefined
              }
              className={imageRight ? 'sm:text-right' : ''}
            />
          </div>

          {/* Directional CTA — pinned to bottom on desktop, arrow flips to match image side */}
          <Link
            href={`/portfolio/${gallery.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors duration-fast hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {imageRight && (
              <span className="transition-transform duration-fast group-hover:-translate-x-0.5">
                ←
              </span>
            )}
            <span>Enter gallery</span>
            {!imageRight && (
              <span className="transition-transform duration-fast group-hover:translate-x-0.5">
                →
              </span>
            )}
          </Link>
        </div>
      </article>
    </>
  );
};
