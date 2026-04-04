import Image from '../../components/img';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { PublicApiError, fetchPublicGalleryDetail, type GalleryDetail } from '@repo/core';

import { getServerEnv } from '../../lib/env';
import { Frame } from '../../components/frame';
import { Placard } from '../../components/placard';
import { GalleryReviews } from '../../components/gallery-reviews';

type GalleryReview = {
  id: string;
  clientName: string;
  quote: string;
  sessionType: string | null;
};

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> => {
  const { ADMIN_API_BASE_URL } = getServerEnv();

  try {
    const gallery = await fetchPublicGalleryDetail(ADMIN_API_BASE_URL, params.slug, {
      next: { revalidate: 60 }
    });

    const title = `${gallery.title} | Evryday Archive Co`;
    const description =
      gallery.description ?? 'A photography gallery by Reed McIlwain — Evryday Archive Co.';

    return {
      title,
      description,
      alternates: { canonical: `/portfolio/${params.slug}` },
      openGraph: {
        title,
        description,
        url: `https://www.evrydayarchive.co/portfolio/${params.slug}`,
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image'
      }
    };
  } catch {
    return {};
  }
};

const GalleryDetailPage = async ({ params }: { params: { slug: string } }) => {
  const { ADMIN_API_BASE_URL } = getServerEnv();
  let gallery: GalleryDetail | null = null;
  let reviews: GalleryReview[] = [];

  try {
    gallery = await fetchPublicGalleryDetail(ADMIN_API_BASE_URL, params.slug, {
      next: { revalidate: 60 }
    });
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }

    if (error instanceof Error) {
      console.warn('[portfolio] Failed to load gallery detail.', error.message);
    }
  }

  if (!gallery) {
    notFound();
  }

  try {
    const res = await fetch(
      new URL(
        `/api/public/galleries/${encodeURIComponent(params.slug)}/reviews`,
        ADMIN_API_BASE_URL
      ),
      { next: { revalidate: 60 } }
    );
    if (res.ok) reviews = await res.json();
  } catch {
    // Reviews are optional
  }

  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back link */}
        <div className="mb-10">
          <Link
            href="/portfolio"
            className="text-sm text-ink-faint transition-colors duration-fast hover:text-ink"
          >
            ← Portfolio
          </Link>
        </div>

        {/* Opening panel */}
        <header className="mb-16 max-w-2xl">
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
              {gallery.location ?? 'Gallery'}
            </p>
            {gallery.shootDate && (
              <p className="font-mono text-xs text-ink-faint">
                {new Date(gallery.shootDate).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            )}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {gallery.title}
          </h1>
          {gallery.headline && (
            <p className="mt-3 text-xl italic leading-snug text-ink-muted">{gallery.headline}</p>
          )}
          {gallery.description && (
            <p className="mt-4 text-base leading-relaxed text-ink-faint">{gallery.description}</p>
          )}
        </header>

        {/* Image grid */}
        {gallery.images.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-ink-faint">No images published yet.</p>
          </div>
        ) : (
          <div className="columns-1 gap-8 sm:columns-2">
            {/*
              GRID mode reorders the feed to [evens..., odds...] (by original index)
              before handing it to the same column-fill masonry used by MASONRY mode.
              Column-fill naturally puts the "evens" group in column 1 and the "odds"
              group in column 2, which reads as 1-2, 3-4, 5-6 pairs across the two
              columns — each column still stacks at natural aspect-ratio heights, so
              pairs can drift out of alignment as heights differ. That drift is
              intentional, not a bug: locking shared row heights (a real CSS grid)
              is exactly what this mode is meant to avoid.
            */}
            {(gallery.imageLayout === 'GRID'
              ? [
                  ...gallery.images.filter((_, i) => i % 2 === 0),
                  ...gallery.images.filter((_, i) => i % 2 === 1)
                ]
              : gallery.images
            ).map((image, index) => (
              <figure key={image.id} className="mb-8 break-inside-avoid">
                <Frame>
                  <div
                    className="relative w-full overflow-hidden rounded-sm bg-sun"
                    style={{
                      aspectRatio:
                        image.width && image.height ? `${image.width} / ${image.height}` : '3 / 2'
                    }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 512px, (min-width: 640px) 50vw, 100vw"
                      loading={index < 2 ? 'eager' : 'lazy'}
                    />
                  </div>
                </Frame>

                {image.caption && (
                  <figcaption className="mt-3 pl-1">
                    <Placard title={image.caption} size="sm" />
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {/* Reviews */}
        <GalleryReviews reviews={reviews} />

        {/* Closing panel */}
        <div className="mt-20 border-t border-border pt-16">
          <div className="mx-auto max-w-xl text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
              Thank you
            </p>
            <p className="mb-8 text-base leading-relaxed text-ink-muted">
              Every session documented here was a privilege. If something resonated — or if you want
              to create something similar — reach out.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/inquire"
                className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                Inquire
              </Link>
              <Link
                href="/portfolio"
                className="rounded-card border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                View all galleries
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GalleryDetailPage;
