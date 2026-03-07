import { prisma } from '@repo/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type GallerySummary = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

const GalleriesPage = async () => {
  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/packages" className="text-sm text-slate-500 hover:text-slate-700">
            Packages →
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Portfolio Galleries</h1>
          <p className="text-sm text-slate-500">Manage the published gallery lineup.</p>
        </div>
        <Link
          href="/galleries/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          New gallery
        </Link>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-[1.5fr_1fr_140px] gap-4 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
          <span>Title</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {galleries.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">
            No galleries yet. Create the first one.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {galleries.map((gallery: GallerySummary) => (
              <li
                key={gallery.id}
                className="grid grid-cols-[1.5fr_1fr_140px] gap-4 px-4 py-4 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{gallery.title}</p>
                  <p className="text-xs text-slate-500">/{gallery.slug}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {gallery.status}
                </span>
                <Link
                  href={`/galleries/${gallery.id}`}
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

export default GalleriesPage;
