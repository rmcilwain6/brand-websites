import Link from 'next/link';

import { SectionHeading } from './section-heading';

const STEPS = [
  {
    title: 'Apply',
    body: 'Book a session at the regular price and tick the box to be featured.'
  },
  {
    title: 'A short call',
    body: 'I reply within 24 to 48 hours, usually to set up a quick call.'
  },
  {
    title: 'The shoot',
    body: 'Your session as usual, plus our interview, recorded as audio only.'
  },
  {
    title: 'The written feature',
    body: 'Published here this winter, with links to your work. You read it first.'
  }
];

export const HowItWorks = () => (
  <section className="grid gap-[22px] px-6 pt-[72px] lg:grid-cols-[300px_1fr] lg:gap-16 lg:px-0 lg:pt-[120px]">
    <div className="flex flex-col gap-4">
      <SectionHeading description="Think of a magazine profile: I interview you while we shoot, then write a story about you and your work, in my voice. It's free this round, on top of a regular session. Features are chosen for variety, and everyone gets photographed either way.">
        How it works
      </SectionHeading>
      <Link
        href="/process"
        className="self-start text-[15px] font-medium text-accent-text underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        How a session works <span aria-hidden="true">→</span>
      </Link>
    </div>
    <ol className="grid lg:grid-cols-4 lg:gap-7">
      {STEPS.map(({ title, body }, i) => (
        <li
          key={title}
          className="grid grid-cols-[30px_1fr] gap-3 border-t border-border py-[18px] lg:flex lg:flex-col lg:gap-2 lg:pb-0 lg:pt-4"
        >
          <span className="font-campaign text-[19px] text-accent-text lg:text-xl">{i + 1}</span>
          <span className="flex flex-col gap-1 lg:gap-2">
            <span className="text-base font-semibold text-ink">{title}</span>
            <span className="text-sm leading-[1.55] text-ink-soft">{body}</span>
          </span>
        </li>
      ))}
    </ol>
  </section>
);
