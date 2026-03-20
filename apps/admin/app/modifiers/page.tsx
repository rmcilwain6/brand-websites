import Link from 'next/link';

import { prisma } from '@repo/db';

export const dynamic = 'force-dynamic';

const ModifiersPage = async () => {
  const modifiers = await prisma.modifier.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { packages: true } } }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Modifiers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Global modifier library. Assign these to packages from each package&apos;s edit page.
          </p>
        </div>
        <Link
          href="/modifiers/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          New modifier
        </Link>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white">
        {modifiers.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            No modifiers yet.{' '}
            <Link href="/modifiers/new" className="text-indigo-600 hover:text-indigo-500">
              Create one
            </Link>{' '}
            to start building your library.

          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {modifiers.map((modifier) => (
              <li key={modifier.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {modifier.name}
                    <span className="ml-2 text-xs font-normal text-slate-400">{modifier.type}</span>
                  </p>
                  {modifier.description && (
                    <p className="mt-0.5 text-xs text-slate-500">{modifier.description}</p>
                  )}
                  <p className="mt-0.5 text-xs text-slate-400">
                    {modifier._count.packages === 0
                      ? 'Not assigned to any packages'
                      : `Used in ${modifier._count.packages} package${modifier._count.packages === 1 ? '' : 's'}`}
                    {modifier.priceDeltaCents != null && (
                      <span className="ml-2">
                        {modifier.priceDeltaCents >= 0 ? '+' : ''}$
                        {(modifier.priceDeltaCents / 100).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/modifiers/${modifier.id}`}
                  className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
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

export default ModifiersPage;
