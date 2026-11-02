'use client';

import Image from 'next/image';
import { useState, type CSSProperties } from 'react';

import { Placard } from '../../components/placard';
import { cn } from '../../lib/cn';
import { WALL, type WallSlot } from '../wall';
import { HeroText } from './hero-text';

const Frame = ({
  slot,
  open,
  onToggle
}: {
  slot: WallSlot;
  open: boolean;
  onToggle: () => void;
}) => {
  const [desktopColumns, desktopRows] = slot.desktop;
  const [phoneColumns, phoneRows] = slot.phone ?? [0, 0];
  const captionId = `wall-caption-${slot.number}`;

  return (
    <div
      style={
        {
          '--dc': desktopColumns,
          '--dr': desktopRows,
          '--pc': phoneColumns,
          '--pr': phoneRows
        } as CSSProperties
      }
      className={cn(
        'group relative border-[3px] border-surface bg-surface lg:border-[6px]',
        '[grid-column:span_var(--pc)] [grid-row:span_var(--pr)]',
        'lg:[grid-column:span_var(--dc)] lg:[grid-row:span_var(--dr)]',
        slot.phone ? 'block' : 'hidden lg:block'
      )}
    >
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          sizes={`(min-width: 1024px) ${desktopColumns * 94}px, ${Math.round((phoneColumns / 6) * 100)}vw`}
          className="object-cover"
        />
      </div>

      {/* Slides up on hover and keyboard focus on desktop. On phones, tapping the number toggles it. */}
      <div
        id={captionId}
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-[1] transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none lg:bottom-1 lg:left-11 lg:right-1',
          open
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100'
        )}
      >
        <Placard
          title={slot.title}
          subtitle={slot.subtitle}
          size="sm"
          monoSubtitle
          className="block w-full pl-[34px] lg:pl-2.5"
        />
      </div>

      {/* A 44px target on phones, around a much smaller number. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={captionId}
        aria-label={`Show caption for photo ${slot.number}`}
        className="absolute bottom-0 left-0 z-[2] flex h-11 w-11 items-end justify-start pb-1 pl-1 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <span
          className={cn(
            'px-[5px] py-[3px] font-mono text-[10px] font-medium lg:px-2 lg:py-1 lg:text-[11px]',
            open ? 'bg-accent text-white' : 'bg-surface text-ink'
          )}
        >
          {slot.number}
        </span>
      </button>
    </div>
  );
};

/**
 * The hall's wall of past work, with the hero text hung on it on desktop. Phones get the hero text
 * above a smaller wall, so it's rendered twice and only one is ever displayed.
 */
export const SalonWall = () => {
  const [openNumber, setOpenNumber] = useState<string | null>(null);

  const frames = WALL.map((slot) => (
    <Frame
      key={slot.number}
      slot={slot}
      open={openNumber === slot.number}
      onToggle={() => setOpenNumber(openNumber === slot.number ? null : slot.number)}
    />
  ));

  return (
    <section className="px-6 pt-9 lg:px-0 lg:pt-14">
      <div className="lg:hidden">
        <HeroText />
        <p className="mt-14 text-sm leading-relaxed text-ink-soft">
          People I&apos;ve photographed in their element. Tap a number to see who and where.
        </p>
      </div>

      {/*
        Rows scale with the width on phones and tablets, so frames keep their shape. Phones place
        frames strictly in order so the numbers read 01 up; desktop packs them around the hero text.
      */}
      <div className="mt-4 grid auto-rows-[7.7vw] grid-cols-6 gap-1.5 lg:mt-0 lg:grid-flow-dense lg:auto-rows-[40px] lg:grid-cols-12 lg:gap-3">
        <div className="hidden flex-col justify-center pr-9 lg:flex lg:[grid-column:1/span_5] lg:[grid-row:1/span_11]">
          <HeroText />
        </div>
        {frames}
      </div>
    </section>
  );
};
