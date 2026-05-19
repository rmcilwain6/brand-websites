import type { Metadata } from 'next';
import Image from '../components/img';
import Link from 'next/link';

import { fetchPublicGalleries, type GalleryListItem } from '@repo/core';

import { getServerEnv } from '../lib/env';
import { Frame } from '../components/frame';

export const metadata: Metadata = {
  title: 'Portfolio | Evryday Archive Co',
  description:
    'Browse photography galleries by Reed McIlwain — lifestyle, family, and everyday moments documented across British Columbia.',
  alternates: { canonical: '/portfolio' }
};

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
        <header className="mb-8">
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
      <div className={`relative flex items-center ${index === 0 ? 'py-4' : 'py-10'}`}>
        <div className="flex-1 border-t border-border" />
        <span className="mx-4 font-mono text-base font-semibold tracking-widest text-accent">
          {catalogNum}
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      <article
        className={`flex flex-col gap-6 sm:gap-12 ${imageRight ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}
      >
        {/* ── Mobile: gallery title/location — hidden on desktop ─────────── */}
        <div className="sm:hidden">
          {gallery.location && (
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-ink-faint">
              {gallery.location}
            </p>
          )}
          <h2 className="text-3xl font-semibold tracking-tight text-ink">{gallery.title}</h2>
        </div>

        {/*
         * Framed cover.
         * Mobile: capped at max-w-sm and centered so it doesn't flood the screen.
         * Desktop: max-height 65vh, max-width 35vw — aspect ratio preserved natively.
         */}
        <div className="mx-auto w-full max-w-sm flex-none sm:mx-0 sm:w-auto sm:max-w-none sm:self-center">
          <Link href={`/portfolio/${gallery.slug}`} className="group block">
            <Frame>
              <div className="overflow-hidden rounded-sm bg-sun">
                {gallery.coverImage ? (
                  <Image
                    src={gallery.coverImage.src}
                    alt={gallery.coverImage.alt}
                    width={imgW}
                    height={imgH}
                    className="block h-auto w-full sm:h-auto sm:w-auto sm:max-h-[calc(65vh-2rem)] sm:max-w-[35vw] transition-transform duration-slow group-hover:scale-[1.02]"
                    sizes="(min-width: 640px) 35vw, min(384px, 100vw)"
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

        {/* ── Mobile: centered CTA, always → — hidden on desktop ─────────── */}
        <div className="flex justify-center sm:hidden">
          <Link
            href={`/portfolio/${gallery.slug}`}
            className="group inline-flex items-center gap-3 font-mono text-sm font-semibold uppercase tracking-widest text-ink transition-opacity duration-fast hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span>Enter Gallery</span>
            <span className="text-lg text-accent transition-transform duration-fast group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/*
         * Desktop: wall text column — hidden on mobile.
         * sm:h-[65vh] defines the bay height; justify-between pins the CTA to the bottom.
         * Text and CTA align in the direction of the image (offset 64px from image edge).
         */}
        <div
          className={`hidden sm:flex flex-1 flex-col justify-between sm:h-[65vh] sm:py-10 ${imageRight ? 'sm:items-end sm:pr-16' : 'sm:pl-16'}`}
        >
          <div className={imageRight ? 'sm:text-right' : ''}>
            {gallery.location && (
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-ink-faint">
                {gallery.location}
              </p>
            )}
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {gallery.title}
            </h2>
          </div>

          {/* Arrow faces outward (away from image) to draw the eye to the edge */}
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
