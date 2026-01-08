import Image from 'next/image';
import { notFound } from 'next/navigation';

import { prisma } from '@repo/db';
import { getPublicEnv } from '../../lib/env';

const GalleryDetailPage = async ({ params }: { params: { slug: string } }) => {
  getPublicEnv();
  const gallery = await prisma.gallery.findFirst({
    where: {
      slug: params.slug,
      status: 'PUBLISHED'
    },
    include: {
      images: {
        include: { imageAsset: true },
        orderBy: { order: 'asc' }
      }
    }
  });

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
                  src={image.imageAsset.src}
                  alt={image.imageAsset.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 800px, 100vw"
                />
              </div>
              <figcaption className="text-sm text-slate-600">
                {image.imageAsset.caption ?? image.imageAsset.alt}
              </figcaption>
            </figure>
          ))
        )}
      </section>
    </main>
  );
};

export default GalleryDetailPage;
