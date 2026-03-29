'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

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
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-ink">
              {variant.heading}
            </h2>
          </div>

          {/* Gap — description — same gap below */}
          <div className="mt-6 min-h-[5rem]">
            <p className="text-sm leading-relaxed text-ink-muted">{variant.body}</p>
          </div>
        </div>

        {/* CTAs — always visible, same gap as above/below description */}
        <div className="mt-6 flex gap-3">
          <Link
            href="/inquire"
            className="rounded-card bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Inquire
          </Link>
          <Link
            href="/package-builder"
            className="rounded-card border border-border px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
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
