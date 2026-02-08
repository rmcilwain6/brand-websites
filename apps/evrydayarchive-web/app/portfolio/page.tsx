import Image from 'next/image';
import Link from 'next/link';

import { fetchPublicGalleries, GalleryListResponse } from '@repo/core';

import { getServerEnv } from '../lib/env';

export const dynamic = 'force-dynamic';

const PortfolioPage = async () => {
  const { ADMIN_API_BASE_URL } = getServerEnv();
  let galleries: GalleryListResponse = [];

  try {
    galleries = await fetchPublicGalleries(ADMIN_API_BASE_URL, {
      next: { revalidate: 60 }
    });
  } catch (error) {
    if (error instanceof Error) {
      console.warn('[portfolio] Failed to load galleries.', error.message);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold text-slate-900">Portfolio</h1>
        <p className="text-lg text-slate-600">Browse featured sessions and curated galleries.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {galleries.length === 0 ? (
          <p className="text-sm text-slate-500">No published galleries yet.</p>
        ) : (
          galleries.map((gallery) => {
            const cover = gallery.coverImage;
            return (
              <Link
                key={gallery.id}
                href={`/portfolio/${gallery.slug}`}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <div className="relative h-56 w-full bg-slate-100">
                  {cover ? (
                    <Image
                      src={cover.src}
                      alt={cover.alt}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                      No cover image
                    </div>
                  )}
                </div>
                <div className="space-y-1 px-4 py-4">
                  <h2 className="text-lg font-semibold text-slate-900">{gallery.title}</h2>
                  <p className="text-sm text-slate-500">{gallery.location ?? '—'}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
};

export default PortfolioPage;
