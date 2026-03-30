import Image from 'next/image';

import { type MatStyle, type PlacardPosition, Frame } from './frame';

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
  /** Path to the photo in /public. Omit to show the placeholder. */
  src?: string;
};

export type WallBlock = {
  type: 'block';
  /** locked px value */
  width: number;
  ml: number;
  items: BlockPhoto[];
};

// ── Layout constants ───────────────────────────────────────────────────────────

/**
 * Site header height in px (4rem at 16px base).
 * Used to compute the locked section height on mount.
 */
export const HEADER_H = 64;

/**
 * Minimum section height in px.
 */
export const MIN_SECTION_H = 630;

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

// ── Frame item definitions ─────────────────────────────────────────────────────
// Coordinates are relative to the block's top-left corner.
// Items near the edges intentionally clip for drama — that's fine.
//
// frameH = photoH + 32, frameW = round(photoH × aspectW/aspectH) + 32  (mat p-4 = 16px/side)

export const BLOCK_A_ITEMS: BlockPhoto[] = [
  // Primary portrait
  {
    aspect: '4/5',
    photoH: 380,
    matStyle: 'warm',
    top: 90,
    left: 500,
    placardPosition: 'left-bottom',
    placard: { title: 'Julia & Benjamin', subtitle: 'Nanaimo, Jan 2026' },
    src: '/images/top-brand-images/julia-08.webp'
  },
  // Upper-left small portrait
  {
    aspect: '4/5',
    photoH: 240,
    matStyle: 'neutral',
    top: 40,
    left: 250,
    placardPosition: 'left-bottom',
    placard: { title: 'Pokémon Camp', subtitle: 'Victoria, Mar 2026' },
    src: '/images/top-brand-images/drews-pokemon-camp-02.webp'
  },
  // Lower-right small landscape
  {
    aspect: '3/2',
    photoH: 160,
    matStyle: 'neutral',
    top: 540,
    left: 450,
    placardPosition: 'right-middle',
    placard: { title: 'Science of Wine', subtitle: 'Kamloops, Mar 2026' },
    src: '/images/top-brand-images/science-of-wine-2026-9.webp'
  },
  // Upper-right small landscape
  {
    aspect: '3/2',
    photoH: 200,
    matStyle: 'deep',
    top: 200,
    left: 860,
    placardPosition: 'top-right',
    placard: { title: 'Jess & The Yota', subtitle: 'Kamloops, Jan 2026' },
    src: '/images/top-brand-images/jess&the-yota-12.webp'
  },
  // Lower-left portrait
  {
    aspect: '2/3',
    photoH: 300,
    matStyle: 'warm',
    top: 340,
    left: 100,
    placardPosition: 'bottom-center',
    placard: { title: 'Valleyview Alumni Game', subtitle: 'Kamloops, Dec 2025' },
    src: '/images/top-brand-images/vv-2025-alumni-game-07.webp'
  },
  // Lower-right small landscape
  {
    aspect: '3/2',
    photoH: 200,
    matStyle: 'warm',
    top: 500,
    left: 880,
    placardPosition: 'right-middle',
    placard: { title: 'Nicole', subtitle: 'Victoria, Jan 2026' },
    src: '/images/top-brand-images/nikki&nicole-jan15-03.webp'
  }
];

export const BLOCK_B_ITEMS: BlockPhoto[] = [
  // Primary landscape
  {
    aspect: '3/2',
    photoH: 300,
    matStyle: 'deep',
    top: 300,
    left: 460,
    placardPosition: 'bottom-right',
    placard: { title: 'Kate & Carter', subtitle: 'Kamloops, Dec 2025' },
    src: '/images/top-brand-images/kate&carter-wildlights-17.webp'
  },
  // Upper-left portrait
  {
    aspect: '4/5',
    photoH: 250,
    matStyle: 'deep',
    top: 120,
    left: 140,
    placardPosition: 'top-center',
    placard: { title: 'Science of Wine', subtitle: 'Kamloops, Mar 2026' },
    src: '/images/top-brand-images/science-of-wine-2026-22.webp'
  },
  // Upper-centre small landscape
  {
    aspect: '3/2',
    photoH: 180,
    matStyle: 'deep',
    top: 40,
    left: 500,
    placardPosition: 'right-bottom',
    placard: { title: 'Big White Winter Rally', subtitle: 'Dec 2026' },
    src: '/images/top-brand-images/angus-1.webp'
  },
  // Upper-right medium portrait
  {
    aspect: '4/5',
    photoH: 270,
    matStyle: 'warm',
    top: 90,
    left: 980,
    placardPosition: 'bottom-left',
    placard: { title: 'Pinot', subtitle: 'Victoria, Mar 2026' },
    src: '/images/top-brand-images/pinot.webp'
  },
  // Lower-left portrait
  {
    aspect: '2/3',
    photoH: 280,
    matStyle: 'neutral',
    top: 430,
    left: 100,
    placardPosition: 'right-bottom',
    placard: { title: 'Ruben', subtitle: 'UVic, Mar 2026' },
    src: '/images/top-brand-images/urec-finishedimages-20.webp'
  }
];

export const BLOCK_C_ITEMS: BlockPhoto[] = [
  // Primary portrait
  {
    aspect: '2/3',
    photoH: 450,
    matStyle: 'deep',
    top: 146,
    left: 650,
    placardPosition: 'bottom-left',
    placard: { title: 'Valleyview Alumni Game', subtitle: 'Kamloops, Dec 2025' },
    src: '/images/top-brand-images/vv-2025-alumni-game-26.webp'
  },
  // Upper-left landscape
  {
    aspect: '5/4',
    photoH: 250,
    matStyle: 'warm',
    top: 25,
    left: 180,
    placardPosition: 'bottom-left',
    placard: { title: 'Julia', subtitle: 'Nanaimo, Jan 2026' },
    src: '/images/top-brand-images/julia-06.webp'
  },
  // Lower-centre landscape
  {
    aspect: '3/2',
    photoH: 170,
    matStyle: 'neutral',
    top: 360,
    left: 320,
    placardPosition: 'bottom-left',
    placard: { title: 'Summer Evening', subtitle: 'Riverside Park' },
    src: '/images/top-brand-images/drews-pokemon-camp-06.webp'
  },
  // Lower-left portrait
  {
    aspect: '4/5',
    photoH: 270,
    matStyle: 'deep',
    top: 430,
    left: 40,
    placardPosition: 'left-bottom',
    placard: { title: 'Nikki', subtitle: 'Victoria, Jan 2026' },
    src: '/images/top-brand-images/nikki&nicole-jan15-08.webp'
  },
  // Right portrait (top)
  {
    aspect: '2/3',
    photoH: 250,
    matStyle: 'warm',
    top: 30,
    left: 1020,
    placardPosition: 'bottom-center',
    placard: { title: 'Jess & The Yota', subtitle: 'Kamloops, Jan 2026' },
    src: '/images/top-brand-images/jess&the-yota-10.webp'
  },
  // Right portrait (bottom)
  {
    aspect: '2/3',
    photoH: 250,
    matStyle: 'warm',
    top: 400,
    left: 1020,
    placardPosition: 'bottom-center',
    placard: { title: 'Josue', subtitle: 'UVic, Mar 2026' },
    src: '/images/top-brand-images/urec-finishedimages-14.webp'
  }
];

// ── Block ─────────────────────────────────────────────────────────────────────

export const WallBlockEl = ({ block, shortH }: { block: WallBlock; shortH: boolean }) => (
  <div className="relative h-full flex-none" style={{ width: block.width, marginLeft: block.ml }}>
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
  const [aw, ah] = item.aspect.split('/').map(Number);
  const photoW = Math.round(photoH * (aw / ah));

  return (
    <div className="absolute" style={{ top, left: item.left }}>
      <Frame
        variant="gallery"
        matStyle={item.matStyle}
        mat="md"
        className="block"
        placard={{ title: item.placard.title, subtitle: item.placard.subtitle, size: 'sm' }}
        placardPosition={item.placardPosition}
      >
        <div
          className="relative overflow-hidden bg-black/[0.06]"
          style={{ height: photoH, aspectRatio: item.aspect }}
        >
          {item.src ? (
            <Image
              src={item.src}
              alt={item.placard.title}
              fill
              className="object-cover"
              sizes={`${photoW}px`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="select-none font-mono text-[11px] text-black/20" aria-hidden>
                +
              </span>
            </div>
          )}
        </div>
      </Frame>
    </div>
  );
};
