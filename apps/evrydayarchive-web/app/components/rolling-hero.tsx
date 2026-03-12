'use client';

import Link from 'next/link';

import { cn } from '../lib/cn';
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

type BlockPhoto = {
  aspect: string;
  /** px — inner photo height (mat adds 16px/side on lg = +32px total to frame) */
  photoH: number;
  matStyle: MatStyle;
  /** px from block top — top-left of the FRAME */
  top: number;
  /** px from block left */
  left: number;
  placardPosition: PlacardPosition;
  placard: { title: string; subtitle?: string };
};

type WallBlock = {
  type: 'block';
  width: number;
  /** px — fixed margin-left before the block */
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
  /** number (px) or CSS string e.g. 'calc(100vw - 870px)' */
  ml: number | string;
};

type WallSpacer = {
  type: 'spacer';
  /** CSS width string e.g. 'calc(100vw - 980px)' */
  width: string;
};

type WallItem = WallBlock | WallText | WallSpacer;

// ── Viewport-aware spacing maths ──────────────────────────────────────────────
// Target: on page-load, one CTA panel sits on the left and one block fills the right.
//         The next CTA only enters from the right as the current CTA exits left.
//
// Let T = TEXT_A end x = 80 (ml) + 300 (width) = 380
//         BLOCK_A end x = 380 + 160 (ml) + 620 (width) = 1160
// → TEXT_B.ml = 100vw + T − BLOCK_A.end = calc(100vw − 780px)
//
// Spacer after BLOCK_B synchronises TEXT_A re-entry with TEXT_B exit:
// → SPACER.width = calc(100vw − 920px)

// ── Wall data ─────────────────────────────────────────────────────────────────
// Section min-height ≈ 700px (lg viewport 1024×768 − 64px header).
// Frame mat on lg = p-4 (16px/side), so frameH = photoH + 32, frameW = photoH × aspect + 32.
// Items near the bottom intentionally clip at the section edge for drama.

const TEXT_A: WallText = {
  type: 'text',
  eyebrow: 'Ottawa–Gatineau · Photography',
  heading: 'Quiet days,\ncarefully\ndocumented.',
  body: 'A studio practice rooted in intention — capturing everyday life with honesty and care.',
  ctas: [
    { label: 'Inquire', href: '/inquire', variant: 'primary' },
    { label: 'Explore packages', href: '/packages', variant: 'secondary' }
  ],
  mt: 160,
  ml: 80
};

// Block A — portrait anchor (2/3, photoH=380)
// frameH=412, frameW=285 → x=200–485, y=80–492
const BLOCK_A: WallBlock = {
  type: 'block',
  width: 620,
  ml: 160,
  items: [
    // Primary — large portrait, upper-centre of wall (frameH=412, frameW=285 → x=200–485, y=80–492)
    {
      aspect: '2/3',
      photoH: 380,
      matStyle: 'warm',
      top: 80,
      left: 200,
      placardPosition: 'bottom-left',
      placard: { title: 'Family Portrait', subtitle: 'Ottawa, 2024' }
    },

    // Upper-left small portrait (frameH=192, frameW=139 → x=0–139, y=50–242)
    {
      aspect: '2/3',
      photoH: 160,
      matStyle: 'neutral',
      top: 50,
      left: 0,
      placardPosition: 'bottom-left',
      placard: { title: 'At Home', subtitle: 'Centretown' }
    },

    // Mid-left medium portrait (frameH=232, frameW=192 → x=0–192, y=320–552)
    {
      aspect: '4/5',
      photoH: 200,
      matStyle: 'deep',
      top: 320,
      left: 0,
      placardPosition: 'bottom-left',
      placard: { title: 'Childhood', subtitle: 'Rockcliffe Park' }
    },

    // Upper-right small portrait (frameH=172, frameW=125 → x=490–615, y=50–222)
    {
      aspect: '2/3',
      photoH: 140,
      matStyle: 'neutral',
      top: 50,
      left: 490,
      placardPosition: 'bottom-left',
      placard: { title: 'Street Portraits', subtitle: 'Lower Town' }
    },

    // Lower-right portrait — near bottom (frameH=212, frameW=176 → x=430–606, y=500–712)
    {
      aspect: '4/5',
      photoH: 180,
      matStyle: 'warm',
      top: 500,
      left: 430,
      placardPosition: 'top-left',
      placard: { title: 'Couple Session', subtitle: 'ByWard Market' }
    },

    // Lower-left landscape — clips at section edge (frameH=182, frameW=257 → x=150–407, y=555–737)
    {
      aspect: '3/2',
      photoH: 150,
      matStyle: 'neutral',
      top: 555,
      left: 150,
      placardPosition: 'top-center',
      placard: { title: 'Golden Hour', subtitle: 'Gatineau Park' }
    }
  ]
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
  // Viewport-aware: TEXT_B enters from right exactly as TEXT_A exits left.
  ml: 'calc(100vw - 780px)'
};

// Block B — landscape anchor (3/2, photoH=250) across the top, portraits scattered below
// frameH=282, frameW=405 → x=30–435, y=60–342
const BLOCK_B: WallBlock = {
  type: 'block',
  width: 680,
  ml: 160,
  items: [
    // Primary — wide landscape across upper wall (frameH=282, frameW=405 → x=30–435, y=60–342)
    {
      aspect: '3/2',
      photoH: 250,
      matStyle: 'neutral',
      top: 60,
      left: 30,
      placardPosition: 'bottom-left',
      placard: { title: 'Morning Light', subtitle: 'Rideau River' }
    },

    // Upper-right portrait — right of primary (frameH=187, frameW=135 → x=510–645, y=40–227)
    {
      aspect: '2/3',
      photoH: 155,
      matStyle: 'warm',
      top: 40,
      left: 510,
      placardPosition: 'bottom-left',
      placard: { title: 'An Afternoon', subtitle: 'Glebe' }
    },

    // Mid-right portrait — below upper-right (frameH=222, frameW=159 → x=515–674, y=270–492)
    {
      aspect: '2/3',
      photoH: 190,
      matStyle: 'deep',
      top: 270,
      left: 515,
      placardPosition: 'bottom-left',
      placard: { title: 'The Everyday', subtitle: 'Ottawa–Gatineau' }
    },

    // Lower-left medium portrait (frameH=222, frameW=184 → x=0–184, y=380–602)
    {
      aspect: '4/5',
      photoH: 190,
      matStyle: 'deep',
      top: 380,
      left: 0,
      placardPosition: 'bottom-left',
      placard: { title: 'Neighbourhood Walk', subtitle: 'Westboro' }
    },

    // Lower-centre landscape (frameH=182, frameW=257 → x=190–447, y=380–562)
    {
      aspect: '3/2',
      photoH: 150,
      matStyle: 'neutral',
      top: 380,
      left: 190,
      placardPosition: 'top-center',
      placard: { title: 'Summer Portraits', subtitle: "Mooney's Bay" }
    },

    // Lower-right portrait — clips at bottom (frameH=177, frameW=129 → x=490–619, y=530–707)
    {
      aspect: '2/3',
      photoH: 145,
      matStyle: 'warm',
      top: 530,
      left: 490,
      placardPosition: 'top-left',
      placard: { title: 'Winter Session', subtitle: 'Gatineau Park' }
    }
  ]
};

// Spacer — creates the gap between BLOCK_B and the repeat of TEXT_A so that
// TEXT_A re-enters from the right as TEXT_B exits to the left.
const SPACER: WallSpacer = {
  type: 'spacer',
  width: 'calc(100vw - 920px)'
};

const WALL_SEQUENCE: WallItem[] = [TEXT_A, BLOCK_A, TEXT_B, BLOCK_B, SPACER];

// ── Component ─────────────────────────────────────────────────────────────────

export const RollingHero = () => (
  <section
    className="relative overflow-hidden"
    style={{
      height: 'calc(100vh - 4rem)',
      maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
      WebkitMaskImage:
        'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
    }}
  >
    {/* Accessible content for screen readers / keyboard nav */}
    <div className="sr-only">
      <h1>Quiet days, carefully documented.</h1>
      <p>A studio practice rooted in intention — capturing everyday life with honesty and care.</p>
      <Link href="/inquire">Inquire</Link>
      <Link href="/packages">Explore packages</Link>
      <Link href="/portfolio">View portfolio</Link>
    </div>

    {/* Marquee track — doubled for seamless loop */}
    <div
      aria-hidden="true"
      className="flex items-start animate-marquee"
      style={
        {
          width: 'max-content',
          height: '100%',
          '--marquee-duration': '100s'
        } as React.CSSProperties
      }
    >
      {[...WALL_SEQUENCE, ...WALL_SEQUENCE].map((item, i) => {
        if (item.type === 'block') return <WallBlockEl key={i} block={item} />;
        if (item.type === 'text') return <WallTextEl key={i} item={item} />;
        // spacer
        return <div key={i} style={{ flexShrink: 0, width: item.width }} />;
      })}
    </div>
  </section>
);

// ── Block ─────────────────────────────────────────────────────────────────────

const WallBlockEl = ({ block }: { block: WallBlock }) => (
  <div className="flex-none relative h-full" style={{ width: block.width, marginLeft: block.ml }}>
    {block.items.map((item, i) => (
      <WallPhotoEl key={i} item={item} />
    ))}
  </div>
);

// ── Photo ─────────────────────────────────────────────────────────────────────

const WallPhotoEl = ({ item }: { item: BlockPhoto }) => (
  <div className="absolute" style={{ top: item.top, left: item.left }}>
    <Frame variant="gallery" matStyle={item.matStyle} mat="md" className="block">
      <div
        className="flex items-center justify-center overflow-hidden bg-black/[0.06]"
        style={{ height: item.photoH, aspectRatio: item.aspect }}
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

// ── Text panel ────────────────────────────────────────────────────────────────

const WallTextEl = ({ item }: { item: WallText }) => (
  <div
    className="flex-none flex flex-col justify-center gap-5 w-[300px]"
    style={{ marginTop: item.mt, marginLeft: item.ml, height: 320 }}
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
