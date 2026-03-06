import Link from 'next/link';

import { type Package } from '@repo/db';
import { prisma } from '@repo/db';

export const dynamic = 'force-dynamic';

const PackagesPage = async () => {
  const packages = await prisma.package.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { modifiers: true } }
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/galleries" className="text-sm text-slate-500 hover:text-slate-700">
            ← Galleries
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Packages</h1>
          <p className="text-sm text-slate-500">Manage session packages and modifiers.</p>
        </div>
        <Link
          href="/packages/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          New package
        </Link>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-[1.5fr_1fr_100px_140px] gap-4 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
          <span>Name</span>
          <span>Status</span>
          <span>Modifiers</span>
          <span>Actions</span>
        </div>
        {packages.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">
            No packages yet. Create the first one.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {packages.map((pkg: Package & { _count: { modifiers: number } }) => (
              <li
                key={pkg.id}
                className="grid grid-cols-[1.5fr_1fr_100px_140px] gap-4 px-4 py-4 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{pkg.name}</p>
                  <p className="text-xs text-slate-500">/{pkg.slug}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {pkg.status}
                </span>
                <span className="text-xs text-slate-500">{pkg._count.modifiers}</span>
                <Link
                  href={`/packages/${pkg.id}`}
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

export default PackagesPage;
