import { prisma } from '@repo/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const ReviewsPage = async () => {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      gallery: { select: { title: true, slug: true } }
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/galleries" className="text-sm text-slate-500 hover:text-slate-700">
            Galleries →
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Reviews</h1>
          <p className="text-sm text-slate-500">Manage client testimonials and reviews.</p>
        </div>
        <Link
          href="/reviews/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          New review
        </Link>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-[1.5fr_1fr_80px_80px_120px] gap-4 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
          <span>Client</span>
          <span>Gallery</span>
          <span>Published</span>
          <span>Featured</span>
          <span>Actions</span>
        </div>
        {reviews.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">No reviews yet. Add the first one.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="grid grid-cols-[1.5fr_1fr_80px_80px_120px] gap-4 px-4 py-4 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{review.clientName}</p>
                  {review.sessionType && (
                    <p className="text-xs text-slate-500">{review.sessionType}</p>
                  )}
                </div>
                <span className="text-sm text-slate-600">
                  {review.gallery ? (
                    <span>{review.gallery.title}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {review.isPublished ? (
                    <span className="text-emerald-600">Yes</span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {review.featuredOnHome ? (
                    <span className="text-indigo-600">Yes</span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </span>
                <Link
                  href={`/reviews/${review.id}`}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default ReviewsPage;
