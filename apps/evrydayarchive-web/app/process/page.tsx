import type { Metadata } from 'next';
import Link from 'next/link';

import { ProcessAccordion } from './process-accordion';

export const metadata: Metadata = {
  title: 'How It Works | Evryday Archive Co',
  description: "From first message to finished gallery — here's what working together looks like.",
  alternates: { canonical: '/process' }
};

const ProcessPage = () => {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Page header */}
        <header className="mb-16">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
            How it works
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            The process
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted">
            Simple, honest, and low-pressure. Here&apos;s what working together actually looks like,
            from first message to finished archive.
          </p>
        </header>

        {/* Accordion */}
        <ProcessAccordion />

        {/* CTA */}
        <p className="mt-12 text-base text-ink-muted">
          Still have questions? The{' '}
          <Link
            href="/faq"
            className="font-medium text-ink underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            FAQ
          </Link>{' '}
          covers most of them. Or just{' '}
          <Link
            href="/contact"
            className="font-medium text-ink underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            reach out
          </Link>{' '}
          directly.
        </p>
      </div>
    </main>
  );
};

export default ProcessPage;
