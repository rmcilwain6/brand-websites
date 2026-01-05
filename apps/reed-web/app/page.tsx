import { Button, Card } from '@repo/ui';
import { reedConfig } from '@repo/core';

const HomePage = () => {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-400">
          {reedConfig.name}
        </p>
        <h1 className="text-4xl font-semibold">Reed Web</h1>
        <p className="text-lg text-neutral-300">
          Minimal placeholder for the Reed experience. More to come soon.
        </p>
        <Button className="bg-amber-400 text-neutral-950 hover:bg-amber-300">
          Join the waitlist
        </Button>
      </section>

      <Card title="Shared foundation">
        This page renders shared UI components and imports shared config from the core package.
      </Card>
    </main>
  );
};

export default HomePage;
