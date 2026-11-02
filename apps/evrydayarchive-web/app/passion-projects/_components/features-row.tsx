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
import { ArchCard } from './arch-card';

const arrowCls =
  'flex h-11 w-11 items-center justify-center rounded-full border border-border text-lg text-ink transition-opacity duration-fast disabled:cursor-default disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';

const monoCls = 'font-mono uppercase tracking-[0.16em] text-ink-soft';

/**
 * The features, under the wall. Desktop shows four and slides by four. Phones get a native swipe
 * with the next card peeking. Renders nothing until the first feature publishes.
 */
export const FeaturesRow = ({ features, season }: { features: Feature[]; season: string }) => {
  const [start, setStart] = useState(0);
  const count = features.length;
  const paged = count > RAIL_PAGE;

  if (count === 0) return null;

  return (
    <section className="px-6 pt-[72px] lg:px-0 lg:pt-[120px]">
      <div className="mb-[22px] flex items-baseline justify-between gap-4 lg:mb-8">
        <h2 className="font-campaign text-[34px] font-normal leading-none text-ink lg:text-5xl">
          The features
        </h2>
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

      <div className="-mx-6 snap-x snap-mandatory scroll-px-6 overflow-x-auto px-6 pb-2.5 lg:mx-0 lg:overflow-x-clip lg:px-0 lg:pb-0">
        <ul
          style={{ '--rail-start': start } as CSSProperties}
          className="flex w-max gap-3.5 lg:w-auto lg:gap-8 lg:transition-transform lg:duration-[450ms] lg:ease-out lg:[transform:translateX(calc(var(--rail-start)*(100%+2rem)/-4))] motion-reduce:lg:transition-none"
        >
          {features.map(({ number, name, oneLiner, href, image }, index) => (
            <li
              key={number}
              // Keeps a card reached with the keyboard in view.
              onFocus={() => setStart(railStartShowing(index, start, count))}
              className="w-[220px] flex-none snap-start lg:w-[calc((100%-6rem)/4)]"
            >
              <ArchCard number={number} name={name} oneLiner={oneLiner} href={href} image={image} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
