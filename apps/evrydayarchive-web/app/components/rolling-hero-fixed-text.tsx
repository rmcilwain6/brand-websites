'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { cn } from '../lib/cn';
import { HERO_TEXT_VARIANTS } from '../lib/hero-copy';
import {
  BLOCK_A_ITEMS,
  BLOCK_B_ITEMS,
  BLOCK_C_ITEMS,
  HEADER_H,
  MIN_SECTION_H,
  SHORT_H_THRESHOLD,
  getTier,
  WallBlockEl,
  type Tier,
  type WallBlock
} from './rolling-hero';

// ── Layout constants ───────────────────────────────────────────────────────────

/**
 * Computes the pixel width of the left text panel at the current viewport width.
 * Mirrors the CSS: clamp(300px, 32vw, 500px).
 */
function calcLeftPanelW(): number {
  return Math.min(Math.max(window.innerWidth * 0.3333, 300), 640);
}

/** Marquee duration — photos only, no text panels, so slightly shorter than the full hero. */
const MARQUEE_DURATION = '90s';

/**
 * Mask applied to the photo strip.
 * Subtle left-edge fade (~4%) so photos dissolve as they exit toward the text panel.
 * Stronger right-edge fade (~9%) so photos emerge gracefully from the far edge.
 */
const STRIP_MASK =
  'linear-gradient(to right, transparent 0%, black 4%, black 91%, transparent 100%)';

/** How long each text variant is shown before cross-fading to the next. */
const TEXT_CYCLE_MS = 7000;
/** Opacity transition duration (matches the CSS transition-duration). */
const TEXT_FADE_MS = 600;

// ── Per-variant layout config ──────────────────────────────────────────────────
// Each variant gets a distinct position and typographic treatment on the wall.
// Text fades out at its current position, then fades back in at the new one —
// deliberately no motion, just a placement change between cycles.

type VariantLayout = {
  /** Distance from the top of the panel as a CSS percentage string */
  top: string;
  align: 'left' | 'center' | 'right';
  headingClass: string;
  showEyebrow: boolean;
  showBody: boolean;
};

const VARIANT_LAYOUTS: VariantLayout[] = [
  // V1: "Your everyday life is worth documenting."
  // Primary manifesto — owns the upper-left, full content, most prominent.
  { top: '10%', align: 'left', headingClass: 'text-3xl', showEyebrow: true, showBody: true },

  // V2: "Build a session around your budget"
  // Practical/actionable — sits mid-wall, right-aligned, near the CTAs.
  // Body omitted: the copy is long and proximity to the buttons carries the intent.
  { top: '30%', align: 'right', headingClass: 'text-2xl', showEyebrow: true, showBody: false },

  // V3: "Made for first timers and the curious."
  // Warm and welcoming — upper-center, eyebrow dropped so the heading breathes.
  { top: '7%', align: 'center', headingClass: 'text-3xl', showEyebrow: false, showBody: true }
];

// ── Photo sequence ─────────────────────────────────────────────────────────────

type WallSpacer = { type: 'spacer'; width: number };

function buildPhotoSequence(blockW: number, tier: Tier): (WallBlock | WallSpacer)[] {
  return [
    { type: 'block', width: blockW, ml: 0, items: BLOCK_A_ITEMS[tier] },
    { type: 'spacer', width: 60 },
    { type: 'block', width: blockW, ml: 0, items: BLOCK_B_ITEMS[tier] },
    { type: 'spacer', width: 60 },
    { type: 'block', width: blockW, ml: 0, items: BLOCK_C_ITEMS[tier] },
    { type: 'spacer', width: 60 }
  ];
}

// ── Component ──────────────────────────────────────────────────────────────────

export const RollingHeroFixedText = () => {
  // Locked on mount — same strategy as RollingHero.
  const [locked, setLocked] = useState<{
    blockW: number;
    sectionH: number;
    shortH: boolean;
    sequence: (WallBlock | WallSpacer)[];
  } | null>(null);

  // Index into HERO_TEXT_VARIANTS driving the cross-fade.
  const [textIdx, setTextIdx] = useState(0);
  // Controls opacity of the copy block — false during the brief fade-out gap.
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    const leftPanelW = calcLeftPanelW();
    const blockW = window.innerWidth - leftPanelW;
    const sectionH = Math.max(window.innerHeight - HEADER_H, MIN_SECTION_H);
    const shortH = sectionH < SHORT_H_THRESHOLD;
    const tier = getTier(blockW);
    setLocked({ blockW, sectionH, shortH, sequence: buildPhotoSequence(blockW, tier) });
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

  if (!locked) return null;

  const variant = HERO_TEXT_VARIANTS[textIdx];
  const layout = VARIANT_LAYOUTS[textIdx];
  // Double the sequence for the seamless translateX(-50%) loop.
  const trackItems = [...locked.sequence, ...locked.sequence];

  return (
    <section className="relative flex overflow-hidden" style={{ height: locked.sectionH }}>
      {/* Accessible content — screen readers get the primary heading + links */}
      <div className="sr-only">
        <h1>{HERO_TEXT_VARIANTS[0].heading}</h1>
        <p>{HERO_TEXT_VARIANTS[0].body}</p>
        <Link href="/inquire">Inquire</Link>
        <Link href="/package-builder">Build your package</Link>
      </div>

      {/* ── Left: fixed text panel — used as a gallery wall surface ────────── */}
      <div
        aria-hidden="true"
        className="relative z-10 flex-none overflow-hidden bg-canvas"
        style={{ width: 'clamp(300px, 33.333vw, 640px)' }}
      >
        {/* Fading copy — placement shifts per variant */}
        <div
          className="absolute transition-opacity"
          style={{
            top: layout.top,
            left: 'clamp(2rem, 5vw, 5rem)',
            right: '2.5rem',
            textAlign: layout.align,
            opacity: textVisible ? 1 : 0,
            transitionDuration: `${TEXT_FADE_MS}ms`
          }}
        >
          {layout.showEyebrow && (
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
              {variant.eyebrow}
            </p>
          )}
          <h2
            className={cn(
              'font-semibold leading-tight tracking-tight text-ink',
              layout.headingClass
            )}
          >
            {variant.heading}
          </h2>
          {layout.showBody && (
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">{variant.body}</p>
          )}
        </div>

        {/* CTAs — fixed anchor at 2/3 down, horizontally centered, equal width */}
        <div
          className="absolute flex flex-col gap-2"
          style={{
            top: '66.666%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(220px, calc(100% - clamp(4rem, 10vw, 10rem)))'
          }}
        >
          <Link
            href="/inquire"
            className="w-full rounded-card bg-accent px-5 py-2.5 text-center text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Inquire
          </Link>
          <Link
            href="/package-builder"
            className="w-full rounded-card border border-border px-5 py-2.5 text-center text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Build your package
          </Link>
        </div>
      </div>

      {/* ── Right: scrolling photo strip ───────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="relative flex-1 overflow-hidden"
        style={{ maskImage: STRIP_MASK, WebkitMaskImage: STRIP_MASK }}
      >
        <div
          className="flex animate-marquee items-start"
          style={
            {
              width: 'max-content',
              height: '100%',
              userSelect: 'none',
              '--marquee-duration': MARQUEE_DURATION
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
