'use client';

import { useState, useEffect, useRef } from 'react';

import { Frame } from '../components/frame';
import { FrameInterior, FrameLabel } from './frame-pieces';

const FRAME_POOL = [
  {
    number: '01',
    widthPx: 200,
    mat: 'md',
    title: 'your favourite memory',
    offsetY: 0,
    catalogRef: 'EAC-2026-471'
  },
  {
    number: '02',
    widthPx: 150,
    mat: 'md',
    title: 'doing what you love',
    offsetY: 0,
    catalogRef: 'EAC-2026-489'
  },
  {
    number: '03',
    widthPx: 270,
    mat: 'md',
    title: 'your partner and you',
    offsetY: 0,
    catalogRef: 'EAC-2026-503'
  },
  {
    number: '04',
    widthPx: 205,
    mat: 'md',
    title: 'a sunday with nowhere to be',
    offsetY: 0,
    catalogRef: 'EAC-2026-517'
  },
  {
    number: '05',
    widthPx: 290,
    mat: 'md',
    title: 'the quiet between moments',
    offsetY: 0,
    catalogRef: 'EAC-2026-534'
  },
  {
    number: '06',
    widthPx: 180,
    mat: 'md',
    title: 'just the two of you',
    offsetY: 0,
    catalogRef: 'EAC-2026-562'
  }
] satisfies Array<{
  number: string;
  widthPx: number;
  mat: 'none' | 'sm' | 'md' | 'lg';
  title: string;
  offsetY: number;
  catalogRef: string;
}>;

const GAP = 24; // matches gap-6
const PADDING_RATIO = 0.06; // left padding is 6% of panel width
const MIN_FRAMES = 2;

// Returns how many frames fit entirely within the available width.
// No bleed frame — as soon as a frame would be cut off it's excluded.
function countFrames(panelWidth: number): number {
  const available = panelWidth * (1 - PADDING_RATIO);
  let total = 0;
  let count = 0;
  for (let i = 0; i < FRAME_POOL.length; i++) {
    const needed = (i > 0 ? GAP : 0) + FRAME_POOL[i].widthPx;
    if (total + needed > available) break;
    total += needed;
    count++;
  }
  return Math.max(MIN_FRAMES, count);
}

export function GalleryRow() {
  const panelRef = useRef<HTMLDivElement>(null);
  // Default to 3 (laptop assumption) to minimise layout shift on hydration.
  const [count, setCount] = useState(3);

  useEffect(() => {
    const recalculate = () => {
      if (!panelRef.current) return;
      setCount(countFrames(panelRef.current.offsetWidth));
    };

    recalculate();
    const ro = new ResizeObserver(recalculate);
    if (panelRef.current) ro.observe(panelRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    // Outer div fills the panel — used only to measure available width via ref.
    <div ref={panelRef} className="absolute inset-0">
      {/* Row is absolutely positioned so its bottom edge sits at 1/3 down the panel. */}
      <div
        className="absolute flex flex-row items-end gap-6"
        style={{ left: '6%', top: '70%', transform: 'translateY(-100%)' }}
      >
        {/* All frames stay in the DOM. Frames beyond `count` fade to invisible so
            there are no layout pops — the overflow-hidden panel hides the empty space. */}
        {FRAME_POOL.map((f, i) => (
          <div
            key={f.number}
            className="flex-shrink-0 transition-opacity duration-500"
            style={{ opacity: i < count ? 1 : 0, pointerEvents: i < count ? undefined : 'none' }}
          >
            <div
              className="flex animate-fade-up flex-col gap-2"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div style={{ width: f.widthPx }}>
                <Frame
                  variant="gallery"
                  mat={f.mat}
                  matStyle="linen"
                  className="aspect-[4/5] w-full rounded-none"
                  borderColor="#4A4540"
                >
                  <FrameInterior number={f.number} catalogRef={f.catalogRef} />
                </Frame>
              </div>
              <FrameLabel number={f.number} title={f.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
