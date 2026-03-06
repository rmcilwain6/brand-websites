import Link from 'next/link';

import NewPackageForm from '../components/NewPackageForm';

const NewPackagePage = () => {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <Link href="/packages" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to packages
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">New Package</h1>
        <p className="text-sm text-slate-500">Create a new session package.</p>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <NewPackageForm />
      </div>
    </main>
  );
};

export default NewPackagePage;
