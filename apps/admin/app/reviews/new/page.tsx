import { prisma } from '@repo/db';
import Link from 'next/link';

import NewReviewForm from '../components/NewReviewForm';

export const dynamic = 'force-dynamic';

const NewReviewPage = async () => {
  const galleries = await prisma.gallery.findMany({
    orderBy: { title: 'asc' },
    select: { id: true, title: true, slug: true }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <Link href="/reviews" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to reviews
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">New review</h1>
        <p className="text-sm text-slate-500">
          Add a client testimonial. You can add photo and date after creating.
        </p>
      </header>
      <NewReviewForm galleries={galleries} />
    </main>
  );
};

export default NewReviewPage;
