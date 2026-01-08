import Image from 'next/image';
import Link from 'next/link';

import { apiFetch } from '@repo/core';

import { getPublicEnv } from '../lib/env';

type GallerySummary = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  images: Array<{
    imageAsset: {
      src: string;
      alt: string;
    };
  }>;
};

const PortfolioPage = async () => {
  const { NEXT_PUBLIC_API_BASE_URL } = getPublicEnv();
  const galleries = await apiFetch<GallerySummary[]>(
    `${NEXT_PUBLIC_API_BASE_URL}/api/public/galleries`
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold text-slate-900">Portfolio</h1>
        <p className="text-lg text-slate-600">
          Browse featured sessions and curated galleries.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {galleries.length === 0 ? (
          <p className="text-sm text-slate-500">No published galleries yet.</p>
        ) : (
          galleries.map((gallery) => {
            const cover = gallery.images[0]?.imageAsset;
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
