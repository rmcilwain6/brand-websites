import { SectionHeading } from './section-heading';

const STEPS = [
  {
    title: 'Apply with a session',
    body: 'Pick a package the way you normally would and tick the box to be featured.'
  },
  {
    title: 'A short call',
    body: 'I reply within 24 to 48 hours, usually to set up a quick call.'
  },
  {
    title: 'The session',
    body: 'Photos of you doing your thing, with a conversation while we shoot.'
  },
  {
    title: 'The story',
    body: "Shared here and on Instagram, after you've read it and signed off."
  }
];

export const HowItWorks = () => (
  <section className="grid gap-[22px] px-6 pt-[72px] lg:grid-cols-[300px_1fr] lg:gap-16 lg:px-0 lg:pt-[120px]">
    <SectionHeading description="Features are chosen for variety. Everyone who applies gets photographed either way.">
      How it works
    </SectionHeading>
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
