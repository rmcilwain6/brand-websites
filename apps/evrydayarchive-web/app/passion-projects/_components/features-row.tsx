'use client';

import { useState, type CSSProperties } from 'react';

import { cn } from '../../lib/cn';
import {
  RAIL_PAGE,
  featureCountLabel,
  nextRailStart,
  prevRailStart,
  railLabel,
  railStartShowing,
  type Feature
} from '../features';
import { TEASERS } from '../teasers';
import { ArchCard } from './arch-card';
import { TeaserArch } from './teaser-arch';

const arrowCls =
  'flex h-11 w-11 items-center justify-center rounded-full border border-border text-lg text-ink transition-opacity duration-fast disabled:cursor-default disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';

const monoCls = 'font-mono uppercase tracking-[0.16em] text-ink-soft';

const sectionCls = 'px-6 pt-[72px] lg:px-0 lg:pt-[120px]';
const headerCls = 'mb-[22px] flex items-baseline justify-between gap-4 lg:mb-8';
const headingCls = 'font-campaign text-[34px] font-normal leading-none text-ink lg:text-5xl';
const scrollerCls =
  '-mx-6 snap-x snap-mandatory scroll-px-6 overflow-x-auto px-6 pb-2.5 lg:mx-0 lg:overflow-x-clip lg:px-0 lg:pb-0';
const cardCls = 'w-[220px] flex-none snap-start lg:w-[calc((100%-6rem)/4)]';

/**
 * Before the first feature publishes: the row as it will look, with a frosted "Coming soon" arch
 * in each of the four spots. Same frame as the real row, so nothing moves when features arrive.
 * The hover (arch rises, glass clears, sign rattles) is shared with the home block.
 */
const ComingSoonRow = ({ season }: { season: string }) => (
  <section aria-labelledby="features-heading" className={sectionCls}>
    <div className={headerCls}>
      <h2 id="features-heading" className={headingCls}>
        The features
      </h2>
      <span className={cn(monoCls, 'text-[10px] lg:text-xs')}>
        {season} · {featureCountLabel(0)}
      </span>
    </div>

    <div className={scrollerCls}>
      <ul
        aria-label="Features coming this winter"
        className="flex w-max gap-3.5 lg:w-auto lg:gap-8"
      >
        {TEASERS.slice(0, RAIL_PAGE).map((teaser, i) => (
          <li key={teaser.name} className={cn('pp-teaser flex flex-col pt-1', cardCls)}>
            <TeaserArch teaser={teaser} number={i + 1} sizes="(min-width: 1024px) 256px, 220px" />
          </li>
        ))}
      </ul>
    </div>
  </section>
);

/**
 * The features, under How it works. Desktop shows four and slides by four. Phones get a native
 * swipe with the next card peeking. Shows the coming-soon arches until the first feature publishes.
 */
export const FeaturesRow = ({ features, season }: { features: Feature[]; season: string }) => {
  const [start, setStart] = useState(0);
  const count = features.length;
  const paged = count > RAIL_PAGE;

  if (count === 0) return <ComingSoonRow season={season} />;

  return (
    <section className={sectionCls}>
      <div className={headerCls}>
        <h2 className={headingCls}>The features</h2>
        <div className="flex items-center gap-[18px]">
          <span className={cn(monoCls, 'text-[10px] lg:hidden')}>
            {season} · {featureCountLabel(count)}
          </span>
          <span aria-live="polite" className={cn(monoCls, 'hidden text-xs lg:inline')}>
            {season} · {paged ? railLabel(start, count) : featureCountLabel(count)}
          </span>
          {paged && (
            <span className="hidden gap-2 lg:flex">
              <button
                type="button"
                aria-label="Previous features"
                disabled={start === 0}
                onClick={() => setStart(prevRailStart(start))}
                className={arrowCls}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                aria-label="Next features"
                disabled={nextRailStart(start, count) === start}
                onClick={() => setStart(nextRailStart(start, count))}
                className={arrowCls}
              >
                <span aria-hidden="true">→</span>
              </button>
            </span>
          )}
        </div>
      </div>

      <div className={scrollerCls}>
        <ul
          style={{ '--rail-start': start } as CSSProperties}
          className="flex w-max gap-3.5 lg:w-auto lg:gap-8 lg:transition-transform lg:duration-[450ms] lg:ease-out lg:[transform:translateX(calc(var(--rail-start)*(100%+2rem)/-4))] motion-reduce:lg:transition-none"
        >
          {features.map(({ number, name, oneLiner, href, image }, index) => (
            <li
              key={number}
              // Keeps a card reached with the keyboard in view.
              onFocus={() => setStart(railStartShowing(index, start, count))}
              className={cardCls}
            >
              <ArchCard number={number} name={name} oneLiner={oneLiner} href={href} image={image} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
