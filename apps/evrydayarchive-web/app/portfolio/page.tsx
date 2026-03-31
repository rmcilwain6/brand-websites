import Image from '../components/img';
import Link from 'next/link';

import { fetchPublicGalleries, type GalleryListItem } from '@repo/core';

import { getServerEnv } from '../lib/env';
import { Frame } from '../components/frame';

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
  // Even index → image left, odd → image right
  const imageRight = index % 2 !== 0;

  const imgW = gallery.coverImage?.width ?? 1200;
  const imgH = gallery.coverImage?.height ?? 900;

  return (
    <>
      {/* Threshold divider — sits before every entry */}
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
        {/*
         * Framed cover — on desktop: max-height is 65vh minus the Frame's mat (2rem
         * top+bottom), max-width is 45vw. Since width and height are both `auto`,
         * the browser maintains aspect ratio and applies whichever constraint binds first.
         * Portrait images fill close to the full section height; landscape images are
         * narrower and self-center vertically in the bay.
         */}
        <div className="w-full flex-none sm:w-auto sm:self-center">
          <Link href={`/portfolio/${gallery.slug}`} className="group block">
            <Frame>
              <div className="overflow-hidden rounded-sm bg-sun">
                {gallery.coverImage ? (
                  <Image
                    src={gallery.coverImage.src}
                    alt={gallery.coverImage.alt}
                    width={imgW}
                    height={imgH}
                    className="block h-auto w-full sm:h-auto sm:w-auto sm:max-h-[calc(65vh-2rem)] sm:max-w-[45vw] transition-transform duration-slow group-hover:scale-[1.02]"
                    sizes="(min-width: 640px) 45vw, 100vw"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center sm:aspect-auto sm:h-[calc(65vh-2rem)] sm:w-64">
                    <span className="text-xs text-ink-faint">No cover image</span>
                  </div>
                )}
              </div>
            </Frame>
          </Link>
        </div>

        {/*
         * Wall text + CTA.
         * sm:h-[65vh] defines the section height — the text column always fills the
         * full bay so the CTA pins to the bottom regardless of image height.
         */}
        <div className="flex flex-1 flex-col items-start justify-between gap-8 sm:h-[65vh] sm:gap-0 sm:py-10">
          {/* Gallery announcement — sits on the wall */}
          <div>
            {gallery.location && (
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-ink-faint">
                {gallery.location}
              </p>
            )}
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {gallery.title}
            </h2>
          </div>

          {/*
           * Enter gallery CTA — opposite bottom corner from the image.
           * Arrow faces outward (away from image) to draw the eye to the edge.
           */}
          <Link
            href={`/portfolio/${gallery.slug}`}
            className={`group inline-flex items-center gap-3 font-mono text-sm font-semibold uppercase tracking-widest text-ink transition-opacity duration-fast hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${imageRight ? 'sm:self-start' : 'sm:self-end'}`}
          >
            {imageRight && (
              <span className="text-lg text-accent transition-transform duration-fast group-hover:-translate-x-1">
                ←
              </span>
            )}
            <span>Enter Gallery</span>
            {!imageRight && (
              <span className="text-lg text-accent transition-transform duration-fast group-hover:translate-x-1">
                →
              </span>
            )}
          </Link>
        </div>
      </article>
    </>
  );
};
