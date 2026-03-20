import Link from 'next/link';

import NewModifierForm from '../components/NewModifierForm';

const NewModifierPage = () => {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <Link href="/modifiers" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to modifiers
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">New modifier</h1>
        <p className="text-sm text-slate-500">Add a modifier to the global library.</p>
      </header>
      <NewModifierForm />
    </main>
  );
};

export default NewModifierPage;
