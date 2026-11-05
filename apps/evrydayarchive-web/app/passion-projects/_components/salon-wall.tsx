'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

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
  const [desktopColumn, desktopRow] = slot.desktopAt ?? [];

  return (
    <div
      style={
        {
          '--dc': desktopColumns,
          '--dr': desktopRows,
          '--dx': desktopColumn,
          '--dy': desktopRow,
          '--pc': phoneColumns,
          '--pr': phoneRows
        } as CSSProperties
      }
      className={cn(
        'group relative border-[3px] border-surface bg-surface lg:border-[6px]',
        '[grid-column:span_var(--pc)] [grid-row:span_var(--pr)]',
        slot.desktopAt
          ? 'lg:[grid-column:var(--dx)/span_var(--dc)] lg:[grid-row:var(--dy)/span_var(--dr)]'
          : 'lg:[grid-column:span_var(--dc)] lg:[grid-row:span_var(--dr)]',
        slot.phone ? 'block' : 'hidden lg:block'
      )}
    >
      <div data-wall-frame={slot.number} className="relative h-full w-full overflow-hidden">
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          sizes={`(min-width: 1024px) ${desktopColumns * 94}px, ${Math.round((phoneColumns / 6) * 100)}vw`}
          className="object-cover"
        />
      </div>

      {/* Desktop only: slides up on hover and keyboard focus. Smaller screens use the caption bar. */}
      <div
        className={cn(
          'pointer-events-none absolute bottom-1 left-11 right-1 z-[1] hidden transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none lg:block',
          open
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100'
        )}
      >
        <Placard
          title={slot.title}
          subtitle={slot.subtitle}
          size="sm"
          monoSubtitle
          className="block w-full"
        />
      </div>

      {/* The whole photo is the target on smaller screens, and a 44px square around the number on desktop. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`Show caption for photo ${slot.number}`}
        className="absolute inset-0 z-[2] flex items-end justify-start pb-1 pl-1 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent lg:inset-auto lg:bottom-0 lg:left-0 lg:h-11 lg:w-11"
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
 * The caption for the tapped photo on phones and tablets, where a frame is too small to hold one.
 * Sits just above the phone nav, or at the bottom of the screen where the nav is at the top.
 */
const CaptionBar = ({
  slot,
  visible,
  barRef
}: {
  slot: WallSlot | undefined;
  visible: boolean;
  barRef: RefObject<HTMLDivElement>;
}) => (
  // Hidden from screen readers, which get the wall's status line instead.
  <div
    ref={barRef}
    aria-hidden
    className={cn(
      'fixed inset-x-0 bottom-16 z-20 flex min-h-[62px] items-center gap-3 border-t-2 border-accent bg-surface px-6 py-2.5 transition-[opacity,transform,visibility] duration-[180ms] ease-out motion-reduce:transition-none md:bottom-0 lg:hidden',
      visible ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-full opacity-0'
    )}
  >
    {slot && (
      <>
        <span className="bg-accent px-[5px] py-[3px] font-mono text-[10px] font-medium text-white">
          {slot.number}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-ink">{slot.title}</p>
          {slot.subtitle && (
            <p className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft">
              {slot.subtitle}
            </p>
          )}
        </div>
      </>
    )}
  </div>
);

/**
 * The hall's wall of past work, with the hero text hung on it on desktop. Phones get the hero text
 * above a smaller wall, so it's rendered twice and only one is ever displayed.
 */
export const SalonWall = () => {
  const [openNumber, setOpenNumber] = useState<string | null>(null);
  // Outlives openNumber, so the bar keeps its text while it slides away.
  const [captionNumber, setCaptionNumber] = useState<string | null>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const openSlot = WALL.find((slot) => slot.number === openNumber);

  // Moves the page if the bar would land on the photo it's captioning.
  useEffect(() => {
    const bar = barRef.current;
    if (!openNumber || !bar) return;
    const styles = getComputedStyle(bar);
    if (styles.display === 'none') return;

    const frame = wallRef.current?.querySelector(`[data-wall-frame="${openNumber}"]`);
    if (!frame) return;
    const { top, bottom } = frame.getBoundingClientRect();
    const barTop = window.innerHeight - parseFloat(styles.bottom) - bar.offsetHeight;
    const gap = 8;
    // A photo too tall to fit keeps its top on screen.
    const distance = Math.min(bottom + gap - barTop, top - gap);
    if (distance <= 0) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollBy({ top: distance, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [openNumber]);

  // Closes once the wall has scrolled away, so the caption doesn't follow people down the page.
  const isOpen = openNumber !== null;
  useEffect(() => {
    const wall = wallRef.current;
    if (!isOpen || !wall) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && !entry.isIntersecting) setOpenNumber(null);
      },
      // Leaves out the phone nav, which the wall can slide behind.
      { rootMargin: '0px 0px -64px 0px' }
    );
    observer.observe(wall);
    return () => observer.disconnect();
  }, [isOpen]);

  const frames = WALL.map((slot) => (
    <Frame
      key={slot.number}
      slot={slot}
      open={openNumber === slot.number}
      onToggle={() => {
        if (openNumber === slot.number) {
          setOpenNumber(null);
        } else {
          setOpenNumber(slot.number);
          setCaptionNumber(slot.number);
        }
      }}
    />
  ));

  return (
    <section className="px-6 pt-9 lg:px-0 lg:pt-14">
      <div className="lg:hidden">
        <HeroText />
        <p className="mt-14 text-sm leading-relaxed text-ink-soft">
          People I&apos;ve photographed in their element. Tap a photo to see who and where.
        </p>
      </div>

      <p role="status" className="sr-only">
        {openSlot && [openSlot.title, openSlot.subtitle].filter(Boolean).join(', ')}
      </p>
      <CaptionBar
        slot={WALL.find((slot) => slot.number === captionNumber)}
        visible={isOpen}
        barRef={barRef}
      />

      {/*
        Rows scale with the width on phones and tablets, so frames keep their shape. Phones place
        frames strictly in order so the numbers read 01 up; desktop packs them around the hero text.
      */}
      <div
        ref={wallRef}
        className="mt-4 grid auto-rows-[7.7vw] grid-cols-6 gap-1.5 lg:mt-0 lg:grid-flow-dense lg:auto-rows-[40px] lg:grid-cols-12 lg:gap-3"
      >
        <div className="hidden flex-col justify-center pr-9 lg:flex lg:[grid-column:1/span_5] lg:[grid-row:1/span_11]">
          <HeroText />
        </div>
        {frames}
      </div>
    </section>
  );
};
