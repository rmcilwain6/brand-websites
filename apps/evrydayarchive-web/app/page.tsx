import { Button, Card } from '@repo/ui';
import { evrydayarchiveConfig } from '@repo/core';

const HomePage = () => {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          {evrydayarchiveConfig.name}
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">Evryday Archive</h1>
        <p className="text-lg text-slate-600">
          A living archive to capture daily artifacts, stories, and signals.
        </p>
        <div className="flex items-center gap-4">
          <Button>Explore the archive</Button>
          <Button className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-100">
            Submit an artifact
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Shared UI">
          This card and button component are imported from the shared UI package.
        </Card>
        <Card title="Shared Core">
          Config data and shared schemas live in the core package for reuse across sites.
        </Card>
      </section>
    </main>
  );
};

export default HomePage;
