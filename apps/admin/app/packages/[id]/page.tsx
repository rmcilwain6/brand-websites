import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@repo/db';

import PackageEditor from '../components/PackageEditor';

export const dynamic = 'force-dynamic';

const PackageDetailPage = async ({ params }: { params: { id: string } }) => {
  const pkg = await prisma.package.findUnique({
    where: { id: params.id },
    include: {
      modifiers: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!pkg) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header>
        <Link href="/packages" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to packages
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{pkg.name}</h1>
        <p className="text-sm text-slate-500">Edit package details and modifiers.</p>
      </header>
      <PackageEditor pkg={pkg} />
    </main>
  );
};

export default PackageDetailPage;
