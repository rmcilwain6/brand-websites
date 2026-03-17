import { prisma } from '@repo/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ReviewEditor from '../components/ReviewEditor';

export const dynamic = 'force-dynamic';

const ReviewDetailPage = async ({ params }: { params: { id: string } }) => {
  const [review, galleries, allImageAssets] = await Promise.all([
    prisma.review.findUnique({
      where: { id: params.id }
    }),
    prisma.gallery.findMany({
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        images: {
          include: { imageAsset: { select: { id: true, src: true, alt: true } } },
          orderBy: { order: 'asc' }
        }
      }
    }),
    prisma.imageAsset.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, src: true, alt: true }
    })
  ]);

  if (!review) notFound();

  const reviewForEditor = {
    id: review.id,
    clientName: review.clientName,
    quote: review.quote,
    sessionType: review.sessionType,
    sessionDate: review.sessionDate ? review.sessionDate.toISOString().slice(0, 10) : null,
    galleryId: review.galleryId,
    imageAssetId: review.imageAssetId,
    isPublished: review.isPublished,
    featuredOnHome: review.featuredOnHome
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <Link href="/reviews" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to reviews
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{review.clientName}</h1>
        <p className="text-sm text-slate-500">
          {review.sessionType ?? 'Review'} ·{' '}
          {review.isPublished ? (
            <span className="text-emerald-600">Published</span>
          ) : (
            <span className="text-slate-400">Draft</span>
          )}
        </p>
      </header>
      <ReviewEditor
        review={reviewForEditor}
        galleries={galleries}
        allImageAssets={allImageAssets}
      />
    </main>
  );
};

export default ReviewDetailPage;
