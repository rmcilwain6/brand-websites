import Link from 'next/link';

import NewGalleryForm from '../components/NewGalleryForm';

const NewGalleryPage = () => {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <Link href="/galleries" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to galleries
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">New Gallery</h1>
        <p className="text-sm text-slate-500">Create a new portfolio gallery.</p>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <NewGalleryForm />
      </div>
    </main>
  );
};

export default NewGalleryPage;
