import Link from 'next/link';
import { notFound } from 'next/navigation';

import GalleryEditor from '../components/GalleryEditor';
import { prisma } from '@repo/db';

export const dynamic = 'force-dynamic';

const GalleryDetailPage = async ({ params }: { params: { id: string } }) => {
  const gallery = await prisma.gallery.findUnique({
    where: { id: params.id },
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

  const { passwordHash, ...galleryWithoutPasswordHash } = gallery;
  const galleryForEditor = {
    ...galleryWithoutPasswordHash,
    hasPassword: !!passwordHash,
    shootDate: gallery.shootDate?.toISOString() ?? null
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header>
        <Link href="/galleries" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to galleries
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{gallery.title}</h1>
        <p className="text-sm text-slate-500">Edit gallery settings and images.</p>
      </header>

      <GalleryEditor gallery={galleryForEditor} />
    </main>
  );
};

export default GalleryDetailPage;
