import { Newsreader } from 'next/font/google';
import Image from './img';
import Link from 'next/link';

import { cn } from '../lib/cn';
import { featureLabel } from '../passion-projects/_components/feature-label';

// The campaign face. The rest of the site doesn't use it, so it's loaded for this block only.
const newsreader = Newsreader({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap'
});

/**
 * Stand-ins for the features to come. The blur is baked into these files, so the sharp photos never
 * reach the browser: 400×531 (the arch's 64:85), zoomed 1.15×, saturation 1.15, then a Gaussian
 * blur of sigma 21. That's 60% of the frosted-glass blur Reed picked on the design canvas.
 * Swap in the real features' photos the same way once they're chosen.
 */
const TEASERS = [
  { src: '/images/passion-projects/teaser-01.webp', name: 'Someone you know?' },
  { src: '/images/passion-projects/teaser-02.webp', name: 'A business you love?' },
  { src: '/images/passion-projects/teaser-03.webp', name: 'You?' }
] as const;

/**
 * The home page's way in to Passion Projects: the invitation on the left, and three frosted arches
 * for the features that haven't been unveiled yet.
 *
 * Stacked as intro → arches → question until `xl`, where the text moves into a column beside the
 * arches (any earlier and the arches get too narrow). Phones scroll the arches sideways; from `md`
 * all three fit in a row.
 */
export const PassionProjectsTeaser = () => (
  <section
    aria-labelledby="passion-projects-teaser-heading"
    className={cn(newsreader.variable, 'px-6 py-20 lg:px-8')}
  >
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-y-4 [grid-template-areas:'intro'_'arches'_'ask'] lg:gap-y-[18px] xl:max-w-7xl xl:grid-cols-[400px_minmax(0,1fr)] xl:grid-rows-[1fr_auto_auto_1fr] xl:gap-x-[72px] xl:[grid-template-areas:'._arches'_'intro_arches'_'ask_arches'_'._arches']">
      <div className="flex max-w-xl flex-col gap-4 [grid-area:intro] lg:gap-[18px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent-text sm:tracking-[0.16em]">
          Introducing Passion Projects{' '}
          {/* Kept together, so a narrow phone wraps before the dot rather than after it. */}
          <span className="whitespace-nowrap">· Winter 2026</span>
        </p>
        <h2
          id="passion-projects-teaser-heading"
          className="font-campaign text-4xl font-normal min-[360px]:text-[42px] leading-none tracking-[-0.02em] text-ink lg:text-5xl lg:leading-none"
        >
          I need your help.
        </h2>
        <p className="text-base leading-[1.65] text-ink-muted">
          Somewhere close by, someone is putting years into a craft, a project, or a business they
          love. They deserve to have their story told.
        </p>
      </div>

      <ul
        aria-label="Features coming this winter"
        className="-mr-6 my-2 flex snap-x snap-mandatory gap-3.5 overflow-x-auto pr-6 scrollbar-none [grid-area:arches] md:mr-0 md:grid md:snap-none md:grid-cols-3 md:gap-6 md:overflow-visible md:pr-0 lg:my-4 xl:my-0 xl:self-center"
      >
        {TEASERS.map((teaser, i) => (
          <li key={teaser.src} className="flex w-[208px] flex-none snap-start flex-col md:w-auto">
            <span className="relative block aspect-[64/85] overflow-hidden rounded-t-full bg-sun">
              {/* Decorative: the blur is the point, so there's nothing to describe. */}
              <Image
                src={teaser.src}
                alt=""
                fill
                sizes="(min-width: 768px) 240px, 208px"
                className="object-cover"
              />
              <span className="absolute inset-0 bg-[rgba(247,244,239,0.38)] dark:bg-[rgba(27,26,25,0.3)]" />
              <span className="absolute bottom-[18px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface px-[9px] py-[5px] font-mono text-[10px] uppercase tracking-[0.14em] text-ink shadow-warm-sm">
                Coming soon
              </span>
            </span>
            <span aria-hidden="true" className="h-1 bg-accent lg:h-[5px]" />
            <span className="mt-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-text">
              {featureLabel(i + 1)}
            </span>
            <span className="mt-1.5 font-campaign text-[22px] leading-[1.12] text-ink lg:text-[26px]">
              {teaser.name}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 [grid-area:ask] md:items-start">
        <p className="font-campaign text-2xl leading-[1.2] text-ink">
          Who would you put in the spotlight?
        </p>
        <Link
          href="/passion-projects"
          className="mt-1 rounded-card bg-accent px-6 py-3.5 text-center text-[15px] font-semibold text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:py-3 lg:text-sm lg:font-medium"
        >
          See how it works
        </Link>
      </div>
    </div>
  </section>
);
