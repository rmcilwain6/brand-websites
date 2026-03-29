'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Frame } from '../components/frame';

const ITEMS = [
  {
    caption: 'The places you lived when you were figuring things out.',
    meta: 'BC, Canada · 2021',
    aspect: 'aspect-[3/4]'
  },
  {
    caption: 'The people who were there for the in-between.',
    meta: 'Kamloops · 2022',
    aspect: 'aspect-[4/3]'
  },
  {
    caption: 'The trip that changed how you thought about things.',
    meta: 'Vancouver Island · 2023',
    aspect: 'aspect-[3/4]'
  },
  {
    caption: 'The animal that made a house feel like home.',
    meta: 'Kamloops · 2022',
    aspect: 'aspect-[4/3]'
  },
  {
    caption: 'The version of you that existed before you knew what came next.',
    meta: 'Kelowna · 2020',
    aspect: 'aspect-[3/4]'
  }
] as const;

const VISIBLE = 3;
const ADVANCE_MS = 4000;

// Encodes both the index and direction so the animation class re-triggers
// when direction flips even if the index happens to be the same value.
type SlideState = { index: number; dir: 1 | -1; seq: number };

export const ArchiveCarousel = () => {
  const [slide, setSlide] = useState<SlideState>({ index: 0, dir: 1, seq: 0 });
  const slideRef = useRef<SlideState>(slide);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = ITEMS.length;

  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      const clamped = ((next % total) + total) % total;
      const next_state: SlideState = { index: clamped, dir, seq: slideRef.current.seq + 1 };
      slideRef.current = next_state;
      setSlide(next_state);
    },
    [total]
  );

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      goTo(slideRef.current.index + 1, 1);
    }, ADVANCE_MS);
  }, [goTo]);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTimer]);

  const handlePrev = () => {
    goTo(slideRef.current.index - 1, -1);
    startTimer();
  };

  const handleNext = () => {
    goTo(slideRef.current.index + 1, 1);
    startTimer();
  };

  const visibleItems = Array.from({ length: VISIBLE }, (_, i) => ITEMS[(slide.index + i) % total]);

  const animClass = slide.dir === 1 ? 'animate-carousel-in-right' : 'animate-carousel-in-left';

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      {/* Prev arrow */}
      <button
        onClick={handlePrev}
        aria-label="Previous"
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <ChevronLeft />
      </button>

      {/* Three frames — key on seq re-triggers the directional animation each transition */}
      <div key={slide.seq} className={`grid flex-1 grid-cols-3 gap-3 sm:gap-5 ${animClass}`}>
        {visibleItems.map((item, i) => (
          <div key={i}>
            <Frame variant="gallery" mat="sm" matStyle="linen">
              <div className={`relative ${item.aspect} w-full bg-mat-linen`}>
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-mono text-[9px] text-ink-faint/50">archive</span>
                </div>
                {/* Archival metadata overlay */}
                <div className="absolute bottom-1.5 left-1.5">
                  <span className="bg-canvas/60 px-1 py-0.5 font-mono text-[8px] text-ink-faint backdrop-blur-sm">
                    {item.meta}
                  </span>
                </div>
              </div>
            </Frame>
            {/* Paired copy line */}
            <p className="mt-2.5 font-mono text-[10px] italic leading-snug text-ink-faint">
              {item.caption}
            </p>
          </div>
        ))}
      </div>

      {/* Next arrow */}
      <button
        onClick={handleNext}
        aria-label="Next"
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <ChevronRight />
      </button>
    </div>
  );
};

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M9 2.5L4.5 7L9 11.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M5 2.5L9.5 7L5 11.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
