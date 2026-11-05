import Link from 'next/link';

import { SectionHeading } from './section-heading';

const FEATURE_POINTS = [
  'The interview is recorded as audio only, never video.',
  "It lives on this site, with links to where people can find you and your work, so it's easy to pass around. I'll share it on Instagram too.",
  'You get to read it before it goes live.'
];

const STEPS = [
  {
    title: 'Apply',
    body: 'Book a session the way you normally would and tick the box to be featured.'
  },
  {
    title: 'A short call',
    body: 'I reply within 24 to 48 hours, usually to set up a quick call.'
  },
  {
    title: 'The shoot',
    body: 'Your photos and the interview, at the same time.'
  },
  {
    title: 'The feature',
    body: 'Written up, read by you, then published. Features go live this winter.'
  }
];

const eyebrowCls = 'font-mono text-[11px] uppercase tracking-[0.16em] text-accent-text';
const linkCls =
  'font-medium text-accent-text underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';

export const HowItWorks = () => (
  <section className="grid gap-[22px] px-6 pt-[72px] lg:grid-cols-[300px_1fr] lg:gap-16 lg:px-0 lg:pt-[120px]">
    <SectionHeading description="Book a regular session at the regular price. Features are chosen for variety. If you're picked, the written feature is free on top, and everyone gets photographed either way.">
      How it works
    </SectionHeading>

    <div className="flex flex-col gap-10 lg:gap-14">
      {/* What someone gets: the feature first, since it's what's new; the photos follow the usual process. */}
      <div className="grid gap-8 lg:grid-cols-[1fr_260px] lg:gap-12">
        <div className="flex flex-col gap-4">
          <p className={eyebrowCls}>The written feature · Free this round</p>
          <p className="font-campaign text-[22px] leading-[1.3] text-ink lg:text-[26px]">
            Think of a magazine profile. I interview you while we shoot, then write a story about
            you and your work, in my voice, built around what you tell me.
          </p>
          <ul className="flex flex-col gap-2.5">
            {FEATURE_POINTS.map((point) => (
              <li
                key={point}
                className="grid grid-cols-[14px_1fr] gap-2.5 text-[15px] leading-[1.55] text-ink-muted"
              >
                <span aria-hidden="true" className="mt-[0.75em] border-t border-accent" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className={eyebrowCls}>Your photos</p>
          <p className="text-[15px] leading-[1.55] text-ink-muted">
            The same as any session: shoot, preview gallery, pick your favourites, final edits.
          </p>
          <Link href="/process" className={`${linkCls} text-[15px]`}>
            See the process <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6">
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
        <p className="text-sm leading-[1.55] text-ink-soft">
          Questions about booking or pricing? The{' '}
          <Link href="/faq" className={linkCls}>
            FAQ
          </Link>{' '}
          covers most of them.
        </p>
      </div>
    </div>
  </section>
);
