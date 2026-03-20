'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { cn } from '../lib/cn';
import { useFeatureFlag } from '../lib/use-feature-flag';
import { type MatStyle, Frame } from './frame';
import { Placard } from './placard';

// ── Placard position system ───────────────────────────────────────────────────
// The `top`/`left` on each BlockPhoto always refers to the top-left of the FRAME.
// The placard hangs off from there in the chosen direction.
// bottom-* positions sit in normal document flow below the frame.
// top-* / left-* / right-* positions are absolute, relative to the frame wrapper.

export type PlacardPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left-top'
  | 'left-middle'
  | 'left-bottom'
  | 'right-top'
  | 'right-middle'
  | 'right-bottom';

const PLACARD_POS: Record<PlacardPosition, string> = {
  'bottom-left': 'mt-2 flex justify-start',
  'bottom-center': 'mt-2 flex justify-center',
  'bottom-right': 'mt-2 flex justify-end',
  'top-left': 'absolute bottom-full mb-2 left-0',
  'top-center': 'absolute bottom-full mb-2 left-1/2 -translate-x-1/2',
  'top-right': 'absolute bottom-full mb-2 right-0',
  'right-top': 'absolute left-full ml-3 top-0',
  'right-middle': 'absolute left-full ml-3 top-1/2 -translate-y-1/2',
  'right-bottom': 'absolute left-full ml-3 bottom-0',
  'left-top': 'absolute right-full mr-3 top-0',
  'left-middle': 'absolute right-full mr-3 top-1/2 -translate-y-1/2',
  'left-bottom': 'absolute right-full mr-3 bottom-0'
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type BlockPhoto = {
  aspect: string;
  /** px — inner photo height (mat adds 16px/side = +32px total to frame) */
  photoH: number;
  matStyle: MatStyle;
  /** px from block top — top-left of the FRAME */
  top: number;
  /** px from block left */
  left: number;
  placardPosition: PlacardPosition;
  placard: { title: string; subtitle?: string };
};

export type WallBlock = {
  type: 'block';
  /** locked px value injected by buildSequence */
  width: number;
  ml: number;
  items: BlockPhoto[];
};

type Cta = { label: string; href: string; variant: 'primary' | 'secondary' };

type WallText = {
  type: 'text';
  eyebrow: string;
  heading: string;
  body: string;
  ctas: Cta[];
  mt: number;
  ml: number;
};

type WallSpacer = {
  type: 'spacer';
  width: number;
};

type WallItem = WallBlock | WallText | WallSpacer;

// ── Layout constants ───────────────────────────────────────────────────────────
/** Width of each CTA text panel in px. */
const TEXT_PANEL_W = 300;

/**
 * Site header height in px (4rem at 16px base).
 * Used to compute the locked section height on mount.
 */
export const HEADER_H = 64;

/**
 * Minimum section height in px.
 * Derived from the deepest frame in shortH (compact) mode:
 * BLOCK_A lower-right landscape — scaled top(443) + scaled frameH(163) = 606px, plus 24px breathing room.
 * Also ensures shortH always activates on screens that need it (630 < SHORT_H_THRESHOLD 680).
 */
export const MIN_SECTION_H = 630;

/**
 * Left margin applied to TEXT_B and TEXT_C panels.
 * Prevents any right-edge frame in the preceding block from feeling flush against the text.
 */
const TEXT_LEAD_ML = 48;

/**
 * Section height threshold below which the compact (shortH) layout activates.
 * Laptops with ~720–768px viewport height land at 656–704px section height — below this line.
 * MacBook Air (900px viewport) and taller screens land above it.
 */
export const SHORT_H_THRESHOLD = 680;

/**
 * Scale factor applied to both photoH and top when shortH is true.
 * Shrinks frames ~18% and compresses vertical positions proportionally,
 * preserving all relative alignments between frames.
 */
export const COMPACT_H_SCALE = 0.82;

// ── Tier system ───────────────────────────────────────────────────────────────
// Breakpoints are in terms of block width (viewport width − TEXT_PANEL_W).
// Each tier builds on the previous — layouts gain frames as space grows.
// Tier is determined once on mount from the locked blockW and never changes.
//
//   sm  blockW < 850    →  viewport ~< 1150px
//   md  blockW < 1150   →  viewport ~< 1450px
//   lg  blockW < 1500   →  viewport ~< 1800px
//   xl  blockW ≥ 1500   →  viewport  ≥ 1800px

export type Tier = 'sm' | 'md' | 'lg' | 'xl';

export function getTier(blockW: number): Tier {
  if (blockW >= 1500) return 'xl';
  if (blockW >= 1150) return 'lg';
  if (blockW >= 850) return 'md';
  return 'sm';
}

// ── Wall text panels ──────────────────────────────────────────────────────────

const TEXT_A: WallText = {
  type: 'text',
  eyebrow: 'Kamloops & British Columbia · Photography',
  heading: 'Quiet days,\ncarefully\ndocumented.',
  body: 'A studio practice rooted in intention — capturing everyday life with honesty and care.',
  ctas: [
    { label: 'Inquire', href: '/inquire', variant: 'primary' },
    { label: 'Explore packages', href: '/packages', variant: 'secondary' }
  ],
  mt: 160,
  ml: 80
};

const TEXT_B: WallText = {
  type: 'text',
  eyebrow: 'The Archive · Est. 2024',
  heading: 'Every day\nworthwhile.',
  body: 'Honest photography for real people — no big productions, no forced smiles.',
  ctas: [
    { label: 'View portfolio', href: '/portfolio', variant: 'primary' },
    { label: 'Our process', href: '/process', variant: 'secondary' }
  ],
  mt: 130,
  ml: TEXT_LEAD_ML
};

const TEXT_C: WallText = {
  type: 'text',
  eyebrow: 'Real Moments · Real Life',
  heading: 'Made for\nyour\neveryday.',
  body: "No big productions, no forced smiles — just honest images of the life you're actually living.",
  ctas: [
    { label: 'Our process', href: '/process', variant: 'primary' },
    { label: 'Read our FAQ', href: '/faq', variant: 'secondary' }
  ],
  mt: 155,
  ml: TEXT_LEAD_ML
};

// ── Frame item definitions ─────────────────────────────────────────────────────
// Items are defined per-tier. Each tier should be a superset of the tier below it
// (same frames, potentially repositioned, plus additional frames for the extra space).
//
// frameH = photoH + 32, frameW = round(photoH × aspectW/aspectH) + 32  (mat p-4 = 16px/side)
// Coordinates are relative to the block's top-left corner.
// Items near the edges intentionally clip for drama — that's fine.

// sm tier: one primary portrait centred in the block.
// blockW midpoint ~786px, sectionH ~704px.
// frameH = photoH + 32, frameW = round(photoH × aspectW/aspectH) + 32
// Primary portrait (photoH=380, 2/3): frameW=285, frameH=412
//   left = (786 − 285) / 2 ≈ 250,  top = (704 − 412) / 2 ≈ 146

const BLOCK_A_SM: BlockPhoto[] = [
  // Primary portrait (frameH=412, frameW=336)
  {
    aspect: '4/5',
    photoH: 380,
    matStyle: 'warm',
    top: 90,
    left: 300,
    placardPosition: 'right-top',
    placard: { title: 'Family Portrait', subtitle: 'Kamloops, 2024' }
  },

  // Upper-left small portrait (frameH=272, frameW=192)
  {
    aspect: '2/3',
    photoH: 240,
    matStyle: 'neutral',
    top: 55,
    left: 70,
    placardPosition: 'bottom-left',
    placard: { title: 'At Home', subtitle: 'Kamloops' }
  },

  // Lower-right small landscape (frameH=192, frameW=272)
  {
    aspect: '3/2',
    photoH: 160,
    matStyle: 'deep',
    top: 540,
    left: 250,
    placardPosition: 'right-middle',
    placard: { title: 'Golden Hour', subtitle: 'Thompson Valley' }
  }
];

const BLOCK_A_MD: BlockPhoto[] = [
  // sm items re-centred — left shifted +100px for wider block
  ...BLOCK_A_SM.map((item) => ({ ...item, left: item.left + 200 })),

  // ── md extras ────────────────────────────────────────────────────
  // Upper-right small landscape (frameH=172, frameW=242)
  {
    aspect: '3/2',
    photoH: 200,
    matStyle: 'neutral',
    top: 180,
    left: 860,
    placardPosition: 'bottom-right',
    placard: { title: 'Park Afternoon', subtitle: 'Riverside Drive' }
  },

  // Lower-left small portrait (frameH=152, frameW=112)
  {
    aspect: '2/3',
    photoH: 200,
    matStyle: 'warm',
    top: 420,
    left: 180,
    placardPosition: 'bottom-left',
    placard: { title: 'Backyard Sessions', subtitle: 'Kamloops' }
  },

  {
    aspect: '2/3',
    photoH: 100,
    matStyle: 'warm',
    top: 550,
    left: 880,
    placardPosition: 'right-middle',
    placard: { title: 'Backyard Sessions', subtitle: 'Kamloops' }
  }
];

const BLOCK_A_LG: BlockPhoto[] = [
  // md items — adjust as needed for wider block, then add lg extras below
  ...BLOCK_A_MD
];

const BLOCK_A_XL: BlockPhoto[] = [
  // lg items — adjust as needed for wider block, then add xl extras below
  ...BLOCK_A_LG
];

export const BLOCK_A_ITEMS: Record<Tier, BlockPhoto[]> = {
  sm: BLOCK_A_SM,
  md: BLOCK_A_MD,
  lg: BLOCK_A_LG,
  xl: BLOCK_A_XL
};

const BLOCK_B_SM: BlockPhoto[] = [
  // Primary landscape (frameH=332, frameW=482)
  {
    aspect: '3/2',
    photoH: 300,
    matStyle: 'neutral',
    top: 300,
    left: 260,
    placardPosition: 'bottom-right',
    placard: { title: 'Morning Light', subtitle: 'Sun Peaks' }
  },

  // Upper-left portrait (frameH=232, frameW=165)
  {
    aspect: '2/3',
    photoH: 200,
    matStyle: 'deep',
    top: 160,
    left: 65,
    placardPosition: 'bottom-right',
    placard: { title: 'Neighbourhood Walk', subtitle: 'Westside' }
  },

  // Lower-right small landscape (frameH=162, frameW=227)
  {
    aspect: '3/2',
    photoH: 130,
    matStyle: 'warm',
    top: 110,
    left: 260,
    placardPosition: 'right-bottom',
    placard: { title: 'Winter Session', subtitle: 'Sun Peaks' }
  }
];

const BLOCK_B_MD: BlockPhoto[] = [
  // sm items re-centred — left shifted +100px for wider block
  ...BLOCK_B_SM.map((item) => ({ ...item, left: item.left + 200 })),

  // ── md extras ────────────────────────────────────────────────────
  // Upper-right medium portrait (frameH=212, frameW=176)
  {
    aspect: '4/5',
    photoH: 270,
    matStyle: 'warm',
    top: 90,
    left: 980,
    placardPosition: 'bottom-center',
    placard: { title: 'Sunday Morning', subtitle: 'Sun Peaks' }
  },

  // Lower-left small landscape (frameH=142, frameW=197)
  {
    aspect: '3/2',
    photoH: 80,
    matStyle: 'deep',
    top: 540,
    left: 130,
    placardPosition: 'right-middle',
    placard: { title: 'River Walk', subtitle: 'Thompson Valley' }
  }
];

const BLOCK_B_LG: BlockPhoto[] = [
  // md items — adjust as needed for wider block, then add lg extras below
  ...BLOCK_B_MD
];

const BLOCK_B_XL: BlockPhoto[] = [
  // lg items — adjust as needed for wider block, then add xl extras below
  ...BLOCK_B_LG
];

export const BLOCK_B_ITEMS: Record<Tier, BlockPhoto[]> = {
  sm: BLOCK_B_SM,
  md: BLOCK_B_MD,
  lg: BLOCK_B_LG,
  xl: BLOCK_B_XL
};

const BLOCK_C_SM: BlockPhoto[] = [
  // Primary portrait (frameH=482, frameW=332)
  {
    aspect: '2/3',
    photoH: 450,
    matStyle: 'deep',
    top: 146,
    left: 500,
    placardPosition: 'bottom-center',
    placard: { title: 'An Afternoon', subtitle: 'Thompson River' }
  },

  // Upper-left medium portrait (frameH=232, frameW=192)
  {
    aspect: '4/5',
    photoH: 200,
    matStyle: 'warm',
    top: 60,
    left: 180,
    placardPosition: 'right-top',
    placard: { title: 'Childhood', subtitle: 'Kamloops' }
  },

  // Lower-centre landscape (frameH=202, frameW=287)
  {
    aspect: '3/2',
    photoH: 170,
    matStyle: 'neutral',
    top: 400,
    left: 180,
    placardPosition: 'top-right',
    placard: { title: 'Summer Evening', subtitle: 'Riverside Park' }
  }
];

const BLOCK_C_MD: BlockPhoto[] = [
  // sm items re-centred — left shifted +100px for wider block
  ...BLOCK_C_SM.map((item) => ({ ...item, left: item.left + 200 })),

  // ── md extras ────────────────────────────────────────────────────
  // Upper-left small portrait (frameH=132, frameW=99)
  {
    aspect: '2/3',
    photoH: 300,
    matStyle: 'deep',
    top: 150,
    left: 90,
    placardPosition: 'bottom-right',
    placard: { title: 'Home Archives', subtitle: 'Kamloops' }
  },

  // Lower-right landscape (frameH=182, frameW=257)
  {
    aspect: '3/2',
    photoH: 100,
    matStyle: 'warm',
    top: 300,
    left: 1060,
    placardPosition: 'top-center',
    placard: { title: 'Late Light', subtitle: 'Sun Peaks' }
  }
];

const BLOCK_C_LG: BlockPhoto[] = [
  // md items — adjust as needed for wider block, then add lg extras below
  ...BLOCK_C_MD
];

const BLOCK_C_XL: BlockPhoto[] = [
  // lg items — adjust as needed for wider block, then add xl extras below
  ...BLOCK_C_LG
];

export const BLOCK_C_ITEMS: Record<Tier, BlockPhoto[]> = {
  sm: BLOCK_C_SM,
  md: BLOCK_C_MD,
  lg: BLOCK_C_LG,
  xl: BLOCK_C_XL
};

// ── Wall sequence ─────────────────────────────────────────────────────────────
// Built once on mount from the locked blockW. Never regenerated.

function buildSequence(blockW: number, tier: Tier): WallItem[] {
  return [
    { type: 'spacer', width: 120 },
    TEXT_A,
    { type: 'block', width: blockW, ml: 0, items: BLOCK_A_ITEMS[tier] },
    TEXT_B,
    { type: 'block', width: blockW, ml: 0, items: BLOCK_B_ITEMS[tier] },
    TEXT_C,
    { type: 'block', width: blockW, ml: 0, items: BLOCK_C_ITEMS[tier] },
    { type: 'spacer', width: 60 }
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────

// Marquee duration scales with sequence length (3 panels + 3 blocks).
const MARQUEE_DURATION = '130s';

const MASK = 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)';

export const RollingHero = () => {
  // ROLLING_HERO_DRAG switches to drag/touch-scroll mode.
  // Default (false) = auto-rolling marquee.
  // Toggle in devtools: window.__flags.enable('ROLLING_HERO_DRAG')
  const dragMode = useFeatureFlag('ROLLING_HERO_DRAG');

  // Locked on mount — never changes for the lifetime of this page view.
  // If the user resizes/zooms after load, the hero dimensions stay fixed;
  // a shorter window just makes the hero scroll vertically like any other content.
  const [locked, setLocked] = useState<{
    blockW: number;
    sectionH: number;
    shortH: boolean;
    tier: Tier;
    sequence: WallItem[];
  } | null>(null);

  useEffect(() => {
    const blockW = window.innerWidth - TEXT_PANEL_W;
    const sectionH = Math.max(window.innerHeight - HEADER_H, MIN_SECTION_H);
    const shortH = sectionH < SHORT_H_THRESHOLD;
    const tier = getTier(blockW);
    setLocked({ blockW, sectionH, shortH, tier, sequence: buildSequence(blockW, tier) });
  }, []); // empty deps — intentionally runs once only

  // Drag-mode state (only active when dragMode = true)
  const scrollRef = useRef<HTMLElement>(null);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    startX.current = e.pageX;
    scrollLeftRef.current = scrollRef.current?.scrollLeft ?? 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft = scrollLeftRef.current - (e.pageX - startX.current);
  };

  const stopDrag = () => setDragging(false);

  // Return null pre-mount — avoids SSR/hydration mismatch.
  // Flash is imperceptible: desktop-only, behind a feature flag.
  if (!locked) return null;

  // Rolling mode doubles the sequence for the seamless translateX(-50%) loop.
  const trackItems = dragMode ? locked.sequence : [...locked.sequence, ...locked.sequence];

  return (
    <section
      ref={dragMode ? scrollRef : undefined}
      className={cn(
        'relative',
        dragMode ? 'scrollbar-none overflow-x-scroll overflow-y-hidden' : 'overflow-hidden'
      )}
      style={{
        height: locked.sectionH,
        cursor: dragMode ? (dragging ? 'grabbing' : 'grab') : undefined,
        maskImage: MASK,
        WebkitMaskImage: MASK
      }}
      {...(dragMode && {
        onMouseDown,
        onMouseMove,
        onMouseUp: stopDrag,
        onMouseLeave: stopDrag
      })}
    >
      {/* Accessible content for screen readers / keyboard nav */}
      <div className="sr-only">
        <h1>Quiet days, carefully documented.</h1>
        <p>
          A studio practice rooted in intention — capturing everyday life with honesty and care.
        </p>
        <Link href="/inquire">Inquire</Link>
        <Link href="/packages">Explore packages</Link>
        <Link href="/portfolio">View portfolio</Link>
      </div>

      {/* Wall track */}
      <div
        aria-hidden="true"
        className={cn('flex items-start', !dragMode && 'animate-marquee')}
        style={{
          width: 'max-content',
          height: '100%',
          userSelect: 'none',
          ...(!dragMode && ({ '--marquee-duration': MARQUEE_DURATION } as React.CSSProperties))
        }}
      >
        {trackItems.map((item, i) => {
          if (item.type === 'block')
            return <WallBlockEl key={i} block={item} shortH={locked.shortH} />;
          if (item.type === 'text') return <WallTextEl key={i} item={item} />;
          return <div key={i} style={{ flexShrink: 0, width: item.width }} />;
        })}
      </div>
    </section>
  );
};

// ── Block ─────────────────────────────────────────────────────────────────────

export const WallBlockEl = ({ block, shortH }: { block: WallBlock; shortH: boolean }) => (
  <div className="flex-none relative h-full" style={{ width: block.width, marginLeft: block.ml }}>
    {block.items.map((item, i) => (
      <WallPhotoEl key={i} item={item} shortH={shortH} />
    ))}
  </div>
);

// ── Photo ─────────────────────────────────────────────────────────────────────

const WallPhotoEl = ({ item, shortH }: { item: BlockPhoto; shortH: boolean }) => {
  const scale = shortH ? COMPACT_H_SCALE : 1;
  const photoH = Math.round(item.photoH * scale);
  const top = Math.round(item.top * scale);

  return (
    <div className="absolute" style={{ top, left: item.left }}>
      <Frame variant="gallery" matStyle={item.matStyle} mat="md" className="block">
        <div
          className="flex items-center justify-center overflow-hidden bg-black/[0.06]"
          style={{ height: photoH, aspectRatio: item.aspect }}
        >
          <span className="select-none font-mono text-[11px] text-black/20" aria-hidden>
            +
          </span>
        </div>
      </Frame>
      <div className={cn(PLACARD_POS[item.placardPosition])}>
        <Placard title={item.placard.title} subtitle={item.placard.subtitle} size="sm" />
      </div>
    </div>
  );
};

// ── Text panel ────────────────────────────────────────────────────────────────

const WallTextEl = ({ item }: { item: WallText }) => (
  <div
    className="flex-none flex flex-col justify-center gap-5"
    style={{ width: TEXT_PANEL_W, marginTop: item.mt, marginLeft: item.ml, height: 320 }}
  >
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
        {item.eyebrow}
      </p>
      <h2 className="whitespace-pre-line text-3xl font-semibold leading-tight tracking-tight text-ink">
        {item.heading}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-ink-muted">{item.body}</p>
    </div>
    <div className="flex flex-wrap gap-3">
      {item.ctas.map((cta) =>
        cta.variant === 'primary' ? (
          <Link
            key={cta.href}
            href={cta.href}
            className="rounded-card bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {cta.label}
          </Link>
        ) : (
          <Link
            key={cta.href}
            href={cta.href}
            className="rounded-card border border-border px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {cta.label}
          </Link>
        )
      )}
    </div>
  </div>
);
