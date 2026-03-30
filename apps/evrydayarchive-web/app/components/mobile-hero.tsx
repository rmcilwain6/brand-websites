'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { HERO_TEXT_VARIANTS } from '../lib/hero-copy';
import { type MatStyle, Frame } from './frame';

const TEXT_CYCLE_MS = 11000;
const TEXT_FADE_MS = 600;

// ── Stack images ──────────────────────────────────────────────────────────────
// All images are cropped to 4/5. Use at least 5 for a clean infinite cycle.
// matStyle defaults to 'neutral'.
type StackImage = {
  src: string;
  matStyle?: MatStyle;
  placard: { title: string; subtitle?: string };
};

const STACK_IMAGES: StackImage[] = [
  {
    src: '/images/top-brand-images/julia-08.webp',
    matStyle: 'deep',
    placard: { title: 'Julia & Benjamin', subtitle: 'Nanaimo, Jan 2026' }
  },
  {
    src: '/images/top-brand-images/jess&the-yota-10.webp',
    matStyle: 'neutral',
    placard: { title: 'Jess & The Yota', subtitle: 'Kamloops, Jan 2026' }
  },

  {
    src: '/images/top-brand-images/kate&carter-wildlights-17.webp',
    matStyle: 'warm',
    placard: { title: 'Kate & Carter', subtitle: 'Kamloops, Dec 2025' }
  },
  {
    src: '/images/top-brand-images/vv-2025-alumni-game-26.webp',
    matStyle: 'neutral',
    placard: { title: 'Valleyview Alumni Game', subtitle: 'Kamloops, Dec 2025' }
  },
  {
    src: '/images/top-brand-images/science-of-wine-2026-22.webp',
    matStyle: 'warm',
    placard: { title: 'Science of Wine', subtitle: 'Kamloops, Mar 2026' }
  },
  {
    src: '/images/top-brand-images/nikki&nicole-jan15-03.webp',
    matStyle: 'neutral',
    placard: { title: 'Nicole', subtitle: 'Victoria, Jan 2026' }
  },

  {
    src: '/images/top-brand-images/pinot.webp',
    matStyle: 'deep',
    placard: { title: 'Pinot', subtitle: 'Victoria, Mar 2026' }
  },
  {
    src: '/images/top-brand-images/urec-finishedimages-14.webp',
    matStyle: 'warm',
    placard: { title: 'Josue', subtitle: 'UVic, Mar 2026' }
  },

  {
    src: '/images/top-brand-images/nikki&nicole-jan15-08.webp',
    matStyle: 'deep',
    placard: { title: 'Nikki', subtitle: 'Victoria, Jan 2026' }
  },

  {
    src: '/images/top-brand-images/drews-pokemon-camp-02.webp',
    matStyle: 'neutral',
    placard: { title: 'Pokémon Camp', subtitle: 'Victoria, Mar 2026' }
  },
  {
    src: '/images/top-brand-images/vv-2025-alumni-game-07.webp',
    matStyle: 'warm',
    placard: { title: 'Valleyview Alumni Game', subtitle: 'Kamloops, Dec 2025' }
  },
  {
    src: '/images/top-brand-images/urec-finishedimages-20.webp',
    matStyle: 'neutral',
    placard: { title: 'Ruben', subtitle: 'UVic, Mar 2026' }
  }
];

// ── Stack layout ──────────────────────────────────────────────────────────────
// depth 0 = top card. Resting rotation + scale for each depth position.
const DEPTH_STYLES = [
  { rotate: 0, scale: 1 }, // top card sits straight
  { rotate: -2.5, scale: 0.97 },
  { rotate: 2, scale: 0.94 },
  { rotate: -1.5, scale: 0.91 }
];

// Fixed image dimensions — uniform stack shape regardless of photo content.
const IMG_W = 240; // px
const IMG_H = 300; // px  (4/5 ratio)

// How far (px) the user must drag before the card is committed to dismiss.
const DISMISS_THRESHOLD = 80;
// How far off-screen (px) the dismissed card travels.
const DISMISS_TRAVEL = 500;

// Estimates the natural pixel width of a placard from its text content.
// Avoids DOM measurement — close enough for a smooth width transition.
// text-sm font-medium ≈ 8.2px/char, text-xs ≈ 7px/char, px-3 = 24px total padding.
function estimatePlacardW(title: string, subtitle?: string): number {
  const titleW = title.length * 8.2 + 24;
  const subtitleW = subtitle ? subtitle.length * 7 + 24 : 0;
  return Math.ceil(Math.max(titleW, subtitleW, 72));
}

// ── PhotoStack ────────────────────────────────────────────────────────────────

const PhotoStack = () => {
  const [order, setOrder] = useState(() => STACK_IMAGES.map((_, i) => i));
  const [dragX, setDragX] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'dismissing' | 'snapping'>('idle');
  const [dismissDir, setDismissDir] = useState<1 | -1>(1);
  const [placardWidth, setPlacardWidth] = useState(() => {
    const img = STACK_IMAGES[0];
    return estimatePlacardW(img.placard.title, img.placard.subtitle);
  });

  // Refs for values needed synchronously in event handlers (avoid stale closures).
  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const phaseRef = useRef(phase);
  const orderRef = useRef(order);
  phaseRef.current = phase;
  orderRef.current = order;

  // Return to idle after a snap-back finishes.
  useEffect(() => {
    if (phase !== 'snapping') return;
    const id = setTimeout(() => setPhase('idle'), 350);
    return () => clearTimeout(id);
  }, [phase]);

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    dragXRef.current = 0;
    setDragX(0);
    setPhase('dragging');
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (phaseRef.current !== 'dragging') return;
    const x = e.touches[0].clientX - startXRef.current;
    dragXRef.current = x;
    setDragX(x);
  };

  const onTouchEnd = () => {
    if (phaseRef.current !== 'dragging') return;
    const x = dragXRef.current;
    if (Math.abs(x) >= DISMISS_THRESHOLD) {
      setDismissDir(x > 0 ? 1 : -1);
      setPhase('dismissing');
    } else {
      setDragX(0);
      setPhase('snapping');
    }
  };

  // Fires when the top card's dismiss animation completes.
  const onTopTransitionEnd = () => {
    if (phaseRef.current !== 'dismissing') return;
    // order[1] is the incoming top — update width in the same batch so it
    // transitions in sync with the opacity fade-in.
    const nextTopIdx = orderRef.current[1] ?? orderRef.current[0];
    const nextTop = STACK_IMAGES[nextTopIdx];
    setPlacardWidth(estimatePlacardW(nextTop.placard.title, nextTop.placard.subtitle));
    setOrder((prev) => [...prev.slice(1), prev[0]]);
    setDragX(0);
    setPhase('idle');
  };

  if (STACK_IMAGES.length === 0) return null;

  const visibleCount = Math.min(DEPTH_STYLES.length, order.length);
  const visibleIndices = order.slice(0, visibleCount);

  // Frame dimensions (image + mat p-4 = 16px each side).
  const frameW = IMG_W + 32;
  const frameH = IMG_H + 32;
  // Container gives 24px breathing room on each side for rotation peek.
  const containerW = frameW + 48;
  const containerH = frameH + 48;

  const topImage = STACK_IMAGES[order[0]];
  // Fade out while the card is flying away; back in once the new card is on top.
  const placardOpacity = phase === 'dismissing' ? 0 : 1;

  // Pull the placard up so it sits 8px below the frame bottom (mt-2, matching desktop
  // bottom-center offset), instead of 8px below the container bottom.
  const placardMt = -((containerH - frameH) / 2) + 8;

  return (
    <div className="flex flex-col items-center">
      <div className="relative mx-auto" style={{ width: containerW, height: containerH }}>
        {/* Render bottom-up so the top card sits highest in the DOM stacking context. */}
        {[...visibleIndices].reverse().map((imgIdx, reversePos) => {
          const depth = visibleCount - 1 - reversePos; // 0 = top
          const isTop = depth === 0;
          const { rotate: baseRotate, scale } = DEPTH_STYLES[depth];

          let tx = 0;
          let rotate = baseRotate;
          let transition = 'transform 0.35s ease-out';

          if (isTop) {
            if (phase === 'dragging') {
              tx = dragX;
              // Subtle tilt follows the drag direction.
              rotate = baseRotate + dragX * 0.04;
              transition = 'none';
            } else if (phase === 'dismissing') {
              tx = dismissDir * DISMISS_TRAVEL;
              rotate = baseRotate + dismissDir * 20;
            }
            // snapping / idle: tx=0, rotate=baseRotate — transition animates the snap-back.
          }

          return (
            <div
              key={imgIdx}
              style={{
                position: 'absolute',
                // Centre each frame within the container.
                top: (containerH - frameH) / 2,
                left: (containerW - frameW) / 2,
                zIndex: visibleCount - depth,
                transform: `translateX(${tx}px) rotate(${rotate}deg) scale(${scale})`,
                transition,
                transformOrigin: 'center center',
                willChange: isTop ? 'transform' : undefined,
                // pan-y: browser handles vertical scroll; we own horizontal.
                touchAction: 'pan-y'
              }}
              {...(isTop && {
                onTouchStart,
                onTouchMove,
                onTouchEnd,
                onTransitionEnd: onTopTransitionEnd
              })}
            >
              <Frame
                variant="gallery"
                matStyle={STACK_IMAGES[imgIdx].matStyle ?? 'neutral'}
                mat="md"
              >
                <div className="relative overflow-hidden" style={{ width: IMG_W, height: IMG_H }}>
                  <Image
                    src={STACK_IMAGES[imgIdx].src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes={`${IMG_W}px`}
                  />
                </div>
              </Frame>
            </div>
          );
        })}
      </div>
      {/* Fixed placard box — flex justify-center wrapper ensures width transition is symmetric */}
      <div className="flex justify-center" style={{ width: containerW, marginTop: placardMt }}>
        <div
          className="border border-border bg-surface px-3 py-2"
          style={{ width: placardWidth, transition: 'width 0.25s ease-out' }}
        >
          <div style={{ opacity: placardOpacity, transition: 'opacity 0.2s ease-out' }}>
            <p className="whitespace-nowrap text-sm font-medium leading-snug text-ink">
              {topImage.placard.title}
            </p>
            {topImage.placard.subtitle && (
              <p className="mt-0.5 whitespace-nowrap text-xs text-ink-muted">
                {topImage.placard.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MobileHero ────────────────────────────────────────────────────────────────

export const MobileHero = () => {
  const [textIdx, setTextIdx] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

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

  const variant = HERO_TEXT_VARIANTS[textIdx];

  return (
    <section className="relative overflow-x-hidden pb-8 pt-10">
      {/* Text block + CTAs — padded, centered on wider screens */}
      <div className="mx-auto max-w-sm px-4 sm:px-6">
        <div
          className="mb-8 transition-opacity"
          style={{ opacity: textVisible ? 1 : 0, transitionDuration: `${TEXT_FADE_MS}ms` }}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
            {variant.eyebrow}
          </p>
          <h1
            className="line-clamp-2 whitespace-pre-line font-semibold leading-tight tracking-tight text-ink"
            style={{ fontSize: 'clamp(1.4rem, 6.5vw, 1.875rem)' }}
          >
            {variant.heading}
          </h1>
          {/* min-h locks to 3 lines of text-sm/leading-relaxed so all variants share the same height */}
          <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed text-ink-muted">
            {variant.body}
          </p>
        </div>

        <div className="mb-10 flex gap-3">
          <Link
            href="/inquire"
            className="flex-1 rounded-card bg-accent px-6 py-3 text-center text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Inquire
          </Link>
          <Link
            href="/package-builder"
            className="flex-1 whitespace-nowrap rounded-card border border-border px-6 py-3 text-center text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Build your package
          </Link>
        </div>
      </div>

      {/* Photo stack */}
      <PhotoStack />
    </section>
  );
};
