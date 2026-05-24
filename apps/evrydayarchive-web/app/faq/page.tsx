import type { Metadata } from 'next';
import Link from 'next/link';

import { FaqAccordion } from './faq-accordion';

export const metadata: Metadata = {
  title: 'FAQs | Evryday Archive Co',
  description:
    'Answers to common questions about booking, pricing, turnaround, and what to expect from an Evryday Archive session.',
  alternates: { canonical: '/faq' }
};

const FaqPage = () => {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Page header */}
        <header className="mb-14">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Common questions
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            FAQ
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-muted">
            If your question isn&apos;t here,{' '}
            <Link
              href="/contact"
              className="font-medium text-ink underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              just ask
            </Link>
            .
          </p>
        </header>

        {/* Accordion */}
        <FaqAccordion />

        {/* CTA */}
        <div className="mt-12 space-y-1 text-base text-ink-muted">
          <p>
            Ready to move forward?{' '}
            <Link
              href="/packages"
              className="font-medium text-ink underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Pick the package that fits you.
            </Link>
          </p>
          <p>
            Or take a look at{' '}
            <Link
              href="/portfolio"
              className="font-medium text-ink underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              the portfolio
            </Link>{' '}
            to see some of the work.
          </p>
        </div>
      </div>
    </main>
  );
};

export default FaqPage;
