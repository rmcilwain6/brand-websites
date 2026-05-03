import type { Metadata } from 'next';

import { Placard } from '../components/placard';

const STEPS = [
  {
    number: '01',
    title: 'Reach out',
    description:
      'Send a message with a rough idea of what you have in mind. No formal brief needed — just tell me the occasion, the people, and what feels important to you.'
  },
  {
    number: '02',
    title: 'We talk it through',
    description:
      'A short conversation to make sure we understand each other. I want to know what success looks like for you, and you should feel comfortable knowing what to expect from the day.'
  },
  {
    number: '03',
    title: 'The session',
    description:
      "We meet, we document. My job is to stay out of the way and let things unfold. There's no forced posing — just good light, honest moments, and time well spent."
  },
  {
    number: '04',
    title: 'Editing & delivery',
    description:
      'I work through the images carefully. Every photo that makes the cut is edited with intention — not over-processed, not undercooked. You receive a private gallery within the agreed timeline.'
  },
  {
    number: '05',
    title: 'After the archive',
    description:
      'The gallery is yours. Print, share, keep. If you want prints or albums arranged, I can help. And if you come back for another session someday, all the better.'
  }
];

export const metadata: Metadata = {
  title: 'How It Works | Evryday Archive Co',
  description:
    'From first inquiry to final gallery — here is how Reed McIlwain documents your everyday life from start to finish.'
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
            Simple, clear, and low-pressure. Here&apos;s what working together looks like from first
            message to finished archive.
          </p>
        </header>

        {/* Steps */}
        <ol className="space-y-12">
          {STEPS.map((step, index) => (
            <li key={step.number} className="flex gap-6 sm:gap-10">
              {/* Step number */}
              <div className="flex-none pt-1">
                <Placard title={step.number} size="sm" />
              </div>

              {/* Step content */}
              <div className="flex-1">
                {/* Connector line (except last) */}
                <div className="relative">
                  {index < STEPS.length - 1 && (
                    <div
                      className="absolute left-[-2.75rem] top-8 hidden h-full w-px bg-border sm:left-[-3.5rem] sm:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <h2 className="mb-2 text-lg font-semibold text-ink">{step.title}</h2>
                <p className="text-base leading-relaxed text-ink-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
};

export default ProcessPage;
