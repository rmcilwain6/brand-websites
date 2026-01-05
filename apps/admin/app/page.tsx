import { Button, Card } from '@repo/ui';
import { adminConfig } from '@repo/core';

const HomePage = () => {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          {adminConfig.name}
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">Admin Console</h1>
        <p className="text-lg text-slate-600">
          Tools and dashboards to manage the Evryday Archive ecosystem.
        </p>
        <Button>Go to dashboard</Button>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Workflow">
          Quick links, status monitoring, and approvals will live here soon.
        </Card>
        <Card title="Shared Components">
          Shared UI ensures the admin experience stays consistent across tools.
        </Card>
      </section>
    </main>
  );
};

export default HomePage;
