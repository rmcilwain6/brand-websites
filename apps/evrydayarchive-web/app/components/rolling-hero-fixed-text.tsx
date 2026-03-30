'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { HERO_TEXT_VARIANTS } from '../lib/hero-copy';
import { useFeatureFlag } from '../lib/use-feature-flag';
import {
  BLOCK_A_ITEMS,
  BLOCK_B_ITEMS,
  BLOCK_C_ITEMS,
  HEADER_H,
  MIN_SECTION_H,
  SHORT_H_THRESHOLD,
  WallBlockEl,
  type WallBlock
} from './rolling-hero';

// ── Layout constants ───────────────────────────────────────────────────────────

/** Marquee duration. */
const MARQUEE_DURATION = '120s';

/**
 * Fixed pixel width of each photo block.
 * Sized to contain the rightmost frame (~1228px) plus breathing room.
 * The wall layout is viewport-independent — wider screens simply reveal more of it.
 */
const BLOCK_W = 1300;

/**
 * Mask applied to the photo strip.
 * Subtle left-edge fade (~4%) so photos dissolve as they exit toward the text panel.
 * Stronger right-edge fade (~9%) so photos emerge gracefully from the far edge.
 */
const STRIP_MASK =
  'linear-gradient(to right, transparent 0%, black 4%, black 91%, transparent 100%)';

/** How long each text variant is shown before cross-fading to the next. */
const TEXT_CYCLE_MS = 11000;
/** Opacity transition duration (matches the CSS transition-duration). */
const TEXT_FADE_MS = 600;

// ── Photo sequence ─────────────────────────────────────────────────────────────

type WallSpacer = { type: 'spacer'; width: number };

function buildPhotoSequence(): (WallBlock | WallSpacer)[] {
  return [
    { type: 'block', width: BLOCK_W, ml: 0, items: BLOCK_A_ITEMS },
    { type: 'block', width: BLOCK_W, ml: 0, items: BLOCK_B_ITEMS },
    { type: 'block', width: BLOCK_W, ml: 0, items: BLOCK_C_ITEMS }
  ];
}

// ── Component ──────────────────────────────────────────────────────────────────

export const RollingHeroFixedText = () => {
  // ROLLING_HERO_DRAG: stops auto-scroll, enables mouse drag + native touch scroll.
  const dragMode = useFeatureFlag('ROLLING_HERO_DRAG');

  const [locked, setLocked] = useState<{
    sectionH: number;
    shortH: boolean;
    sequence: (WallBlock | WallSpacer)[];
  } | null>(null);

  // Index into HERO_TEXT_VARIANTS driving the cross-fade.
  const [textIdx, setTextIdx] = useState(0);
  // Controls opacity of the copy block — false during the brief fade-out gap.
  const [textVisible, setTextVisible] = useState(true);

  // Drag-mode state
  const stripRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    const sectionH = Math.max(window.innerHeight - HEADER_H, MIN_SECTION_H);
    const shortH = sectionH < SHORT_H_THRESHOLD;
    setLocked({ sectionH, shortH, sequence: buildPhotoSequence() });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTextVisible(false);
      const swap = setTimeout(() => {
        setTextIdx((i) => (i + 1) % HERO_TEXT_VARIANTS.length);
        setTextVisible(true);
      }, TEXT_FADE_MS);
      return () => clearTimeout(swap);
    }, TEXT_CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    startX.current = e.pageX;
    scrollLeftRef.current = stripRef.current?.scrollLeft ?? 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !stripRef.current) return;
    e.preventDefault();
    stripRef.current.scrollLeft = scrollLeftRef.current - (e.pageX - startX.current);
  };

  const stopDrag = () => setDragging(false);

  if (!locked) return null;

  const variant = HERO_TEXT_VARIANTS[textIdx];
  // Drag mode uses a single sequence (native scroll); auto mode doubles it for the seamless loop.
  const trackItems = dragMode ? locked.sequence : [...locked.sequence, ...locked.sequence];

  return (
    <section className="relative flex overflow-hidden" style={{ height: locked.sectionH }}>
      {/* Accessible content — screen readers get the primary heading + links */}
      <div className="sr-only">
        <h1>{HERO_TEXT_VARIANTS[0].heading}</h1>
        <p>{HERO_TEXT_VARIANTS[0].body}</p>
        <Link href="/inquire">Inquire</Link>
        <Link href="/package-builder">Build your package</Link>
      </div>

      {/* ── Left: fixed text panel ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="z-10 flex flex-none flex-col justify-start bg-canvas"
        style={{
          width: 'clamp(300px, 33.333vw, 640px)',
          paddingTop: '15%',
          paddingLeft: 'clamp(2rem, 5vw, 5rem)',
          paddingRight: '2.5rem'
        }}
      >
        {/* Fading text — min-heights lock the layout so CTAs never move */}
        <div
          className="transition-opacity"
          style={{ opacity: textVisible ? 1 : 0, transitionDuration: `${TEXT_FADE_MS}ms` }}
        >
          {/* Eyebrow + heading */}
          <div className="min-h-[6.5rem]">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
              {variant.eyebrow}
            </p>
            <h2 className="whitespace-pre-line text-3xl font-semibold leading-tight tracking-tight text-ink">
              {variant.heading}
            </h2>
          </div>

          {/* Gap — description — same gap below */}
          <div className="mt-6 min-h-[5rem]">
            <p className="max-w-[400px] text-sm leading-relaxed text-ink-muted">{variant.body}</p>
          </div>
        </div>

        {/* CTAs — fixed width so both buttons are equal; wrap to stack when no room */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/inquire"
            className="w-44 shrink-0 whitespace-nowrap rounded-card bg-accent px-5 py-2.5 text-center text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Inquire
          </Link>
          <Link
            href="/package-builder"
            className="w-44 shrink-0 whitespace-nowrap rounded-card border border-border px-5 py-2.5 text-center text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Build your package
          </Link>
        </div>
      </div>

      {/* ── Right: photo strip — auto-scroll or drag/touch depending on flag ── */}
      <div
        ref={dragMode ? stripRef : undefined}
        aria-hidden="true"
        className={
          dragMode
            ? 'scrollbar-none relative flex-1 overflow-x-scroll overflow-y-hidden'
            : 'relative flex-1 overflow-hidden'
        }
        style={{
          maskImage: STRIP_MASK,
          WebkitMaskImage: STRIP_MASK,
          cursor: dragMode ? (dragging ? 'grabbing' : 'grab') : undefined
        }}
        {...(dragMode && {
          onMouseDown,
          onMouseMove,
          onMouseUp: stopDrag,
          onMouseLeave: stopDrag
        })}
      >
        <div
          className={dragMode ? 'flex items-start' : 'flex animate-marquee items-start'}
          style={
            {
              width: 'max-content',
              height: '100%',
              userSelect: 'none',
              ...(!dragMode && { '--marquee-duration': MARQUEE_DURATION })
            } as React.CSSProperties
          }
        >
          {trackItems.map((item, i) => {
            if (item.type === 'block')
              return <WallBlockEl key={i} block={item} shortH={locked.shortH} />;
            return <div key={i} style={{ flexShrink: 0, width: item.width }} />;
          })}
        </div>
      </div>
    </section>
  );
};
