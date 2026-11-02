import type { Metadata } from 'next';
import Image from 'next/image';

import { Placard } from '../../components/placard';
import { ArchCard } from '../_components/arch-card';
import { MastheadStrip } from '../_components/masthead-strip';
import { OrangeBand } from '../_components/orange-band';
import { SectionHeading } from '../_components/section-heading';

/**
 * TEMPORARY: a page for checking the campaign components. Delete this folder before launch. Not
 * linked from anywhere. The names and one-liners below are samples, not real features.
 */

export const metadata: Metadata = {
  title: 'Passion Projects components',
  robots: { index: false, follow: false }
};

const SAMPLES = [
  {
    number: 1,
    name: 'Sample name',
    oneLiner: 'A one-liner about what they do',
    src: '/images/top-brand-images/jess&the-yota-10.webp',
    alt: 'A truck on a dusty hillside road'
  },
  {
    number: 2,
    name: 'A longer sample name that wraps',
    oneLiner: 'A longer one-liner, to see how the card handles two or three lines of it',
    src: '/images/top-brand-images/science-of-wine-2026-22.webp',
    alt: 'Two people tasting wine'
  },
  {
    number: 3,
    name: 'Sample name',
    oneLiner: 'A one-liner about what they do',
    src: '/images/top-brand-images/drews-pokemon-camp-02.webp',
    alt: 'A card game in a shop'
  },
  {
    number: 10,
    name: 'Sample name',
    oneLiner: 'A two-digit feature number',
    src: '/images/top-brand-images/urec-finishedimages-14.webp',
    alt: 'A person smiling outdoors'
  }
];

const ComponentsPreview = () => (
  <main>
    <MastheadStrip season="Winter 2026" right="4 features" />

    <div className="flex flex-col gap-16 px-5 py-14 lg:gap-24 lg:px-20">
      <section className="max-w-md">
        <SectionHeading
          eyebrow="Apply"
          description="Two quick questions pick the right package. You can change either answer and the builder follows."
        >
          Tell me a little about it
        </SectionHeading>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeading>The features</SectionHeading>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-8">
          {SAMPLES.map(({ src, alt, ...card }) => (
            <ArchCard key={card.number} {...card} image={{ src, alt }} href="#" />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeading description="The regular placard, then the mono subline over a print.">
          Placards
        </SectionHeading>
        <div className="flex flex-wrap items-start gap-6">
          <Placard title="A title" subtitle="The regular subtitle" />
          <Placard title="A title" subtitle="Kamloops · 2026" monoSubtitle />
          <div className="relative h-64 w-64 overflow-hidden">
            <Image
              src="/images/top-brand-images/julia-08.webp"
              alt="A portrait"
              fill
              sizes="256px"
              className="object-cover"
            />
            <Placard
              title="Over a print"
              subtitle="Victoria · 2026"
              size="sm"
              monoSubtitle
              className="absolute bottom-1 left-1"
            />
          </div>
        </div>
      </section>
    </div>

    <OrangeBand
      heading={
        <>
          Somebody you know is <span className="italic">working on something.</span>
        </>
      }
    >
      <p className="text-lg font-medium leading-normal">
        Send them my way. If they book, you get $15 off a session, whether or not they&apos;re
        featured.
      </p>
      <a
        href="#"
        className="self-start rounded-card bg-[#1b1a19] px-[22px] py-3 text-[15px] font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b1a19]"
      >
        Share this page
      </a>
    </OrangeBand>

    <div className="px-5 py-14 lg:px-20">
      <SectionHeading description="The same band with a quote and no side content.">
        As a pull quote
      </SectionHeading>
    </div>
    <OrangeBand headingAs="blockquote" heading="I never thought anyone would want to see this." />

    <div className="py-10" />
    <MastheadStrip season="Winter 2026" right="Kamloops · Victoria · Vancouver" as="footer" />
    <div className="py-10" />
    <MastheadStrip
      season="Winter 2026"
      right="Feature 01"
      href="/passion-projects/preview"
      as="header"
    />
  </main>
);

export default ComponentsPreview;
