import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@repo/db';

import ModifierEditor from '../components/ModifierEditor';

export const dynamic = 'force-dynamic';

const ModifierDetailPage = async ({ params }: { params: { id: string } }) => {
  const modifier = await prisma.modifier.findUnique({ where: { id: params.id } });

  if (!modifier) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <Link href="/modifiers" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to modifiers
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{modifier.name}</h1>
        <p className="text-sm text-slate-500">Edit modifier definition.</p>
      </header>
      <ModifierEditor modifier={modifier} />
    </main>
  );
};

export default ModifierDetailPage;
