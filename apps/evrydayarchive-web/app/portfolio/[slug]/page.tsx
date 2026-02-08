import Image from 'next/image';
import { notFound } from 'next/navigation';

import { PublicApiError, fetchPublicGalleryDetail, type GalleryDetail } from '@repo/core';

import { getServerEnv } from '../../lib/env';

export const dynamic = 'force-dynamic';

const GalleryDetailPage = async ({ params }: { params: { slug: string } }) => {
  const { ADMIN_API_BASE_URL } = getServerEnv();
  let gallery: GalleryDetail | null = null;

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

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Portfolio gallery
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">{gallery.title}</h1>
        {gallery.description ? (
          <p className="text-lg text-slate-600">{gallery.description}</p>
        ) : null}
      </header>

      <section className="space-y-6">
        {gallery.images.length === 0 ? (
          <p className="text-sm text-slate-500">No images published yet.</p>
        ) : (
          gallery.images.map((image) => (
            <figure key={image.id} className="space-y-2">
              <div className="relative w-full overflow-hidden rounded-lg bg-slate-100 aspect-[3/2]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 800px, 100vw"
                />
              </div>
              <figcaption className="text-sm text-slate-600">
                {image.caption ?? image.alt}
              </figcaption>
            </figure>
          ))
        )}
      </section>
    </main>
  );
};

export default GalleryDetailPage;
