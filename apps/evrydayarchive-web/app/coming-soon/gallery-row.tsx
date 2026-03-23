'use client';

import { useState, useEffect, useRef } from 'react';

import { Frame } from '../components/frame';
import { FrameInterior, FrameLabel } from './frame-pieces';
import { FRAME_POOL } from './frames-data';

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

export function GalleryRow({ onCountChange }: { onCountChange?: (count: number) => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Default to 3 (laptop assumption) to minimise layout shift on hydration.
  const [count, setCount] = useState(3);

  useEffect(() => {
    const recalculate = () => {
      if (!panelRef.current) return;
      const newCount = countFrames(panelRef.current.offsetWidth);
      setCount(newCount);
      onCountChange?.(newCount);
    };

    recalculate();
    const ro = new ResizeObserver(recalculate);
    if (panelRef.current) ro.observe(panelRef.current);
    return () => ro.disconnect();
  }, [onCountChange]);

  return (
    // Outer div fills the panel — used only to measure available width via ref.
    <div ref={panelRef} className="absolute inset-0">
      {/* Row is absolutely positioned so its bottom edge sits at 1/3 down the panel. */}
      <div
        className="absolute flex flex-row items-end gap-6"
        style={{ left: '6%', top: '80%', transform: 'translateY(-100%)' }}
      >
        {/* All frames stay in the DOM. Frames beyond `count` fade to invisible so
            there are no layout pops — the overflow-hidden panel hides the empty space. */}
        {FRAME_POOL.map((f, i) => {
          const frameDelay = 2000 + i * 400;
          const labelDelay = frameDelay + 300;
          return (
            <div
              key={f.number}
              className="flex-shrink-0 transition-opacity duration-500"
              style={{ opacity: i < count ? 1 : 0, pointerEvents: i < count ? undefined : 'none' }}
            >
              <div className="flex flex-col gap-2">
                {/* Frame drops in from above — like being placed on a hook */}
                <div
                  className="animate-hang-drop"
                  style={{
                    width: f.widthPx,
                    animationDelay: `${frameDelay}ms`,
                    animationDuration: '1000ms'
                  }}
                >
                  <Frame
                    variant="gallery"
                    mat={f.mat}
                    matStyle="linen"
                    className="aspect-[2/3] w-full rounded-none"
                    borderColor="#4A4540"
                  >
                    <FrameInterior number={f.number} catalogRef={f.catalogRef} />
                  </Frame>
                </div>
                {/* Placard fades in after the frame settles */}
                <div
                  className="animate-fade-in"
                  style={{ animationDelay: `${labelDelay}ms`, animationDuration: '400ms' }}
                >
                  <FrameLabel frameLabel={f.label} title={f.title} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
