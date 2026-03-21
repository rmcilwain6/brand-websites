/**
 * FrameDesign — empty gallery frames for the coming soon page.
 * Intentionally blank: the emptiness is the point.
 */

import { cn } from '../lib/cn';

// --- Types ---

export interface FrameData {
  /** Catalog number, e.g. "01" */
  number: string;
  /** Width of the frame face in px */
  width: number;
  /** Height of the frame face in px */
  height: number;
  /** Vertical offset in px to stagger frames on desktop */
  offsetY?: number;
}

// --- Default frame set ---

export const FRAMES: FrameData[] = [
  { number: '01', width: 200, height: 268, offsetY: 0 },
  { number: '02', width: 160, height: 210, offsetY: 36 },
  { number: '03', width: 180, height: 244, offsetY: 16 }
];

// --- Crop Mark ---

type CropPosition = 'tl' | 'tr' | 'bl' | 'br';

function CropMark({ position }: { position: CropPosition }) {
  const SIZE = 10;
  const isLeft = position === 'tl' || position === 'bl';
  const isTop = position === 'tl' || position === 'tr';

  const posClass: Record<CropPosition, string> = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0'
  };

  return (
    <div className={cn('absolute', posClass[position])} style={{ width: SIZE, height: SIZE }}>
      {/* Vertical bar */}
      <div
        className={cn('absolute top-0 bg-ink-muted/50', isLeft ? 'left-0' : 'right-0')}
        style={{ width: 0.75, height: SIZE }}
      />
      {/* Horizontal bar */}
      <div
        className={cn('absolute left-0 bg-ink-muted/50', isTop ? 'top-0' : 'bottom-0')}
        style={{ height: 0.75, width: SIZE }}
      />
    </div>
  );
}

// --- Single Frame ---

export function ArchiveFrame({ frame }: { frame: FrameData }) {
  const { number, width, height } = frame;
  const year = new Date().getFullYear();

  return (
    <div className="flex flex-col gap-2" style={{ marginTop: frame.offsetY ?? 0 }}>
      {/* Crop mark wrapper */}
      <div className="relative p-3" style={{ width: width + 24 }}>
        <CropMark position="tl" />
        <CropMark position="tr" />
        <CropMark position="bl" />
        <CropMark position="br" />

        {/* Outer border — heavier, architectural */}
        <div style={{ border: '0.75px solid var(--color-ink-muted)', padding: '5px' }}>
          {/* Inner border — recessed, lighter */}
          <div style={{ border: '0.5px solid rgba(43, 43, 43, 0.28)' }}>
            {/* Frame face — warm aged paper, intentionally empty */}
            <div
              className="relative flex flex-col justify-end overflow-hidden bg-canvas"
              style={{ width, height }}
            >
              {/* Catalog metadata — pinned to bottom of frame face */}
              <div
                className="w-full"
                style={{
                  padding: '10px 14px 12px',
                  borderTop: '0.5px solid var(--color-border)'
                }}
              >
                <div className="mb-[7px] h-px w-7 bg-accent" />
                <span className="mb-0.5 block text-[9px] uppercase tracking-[0.12em] text-ink-muted">
                  Evryday Archive Co.
                </span>
                <span className="block text-[9px] uppercase tracking-[0.08em] text-ink-faint">
                  No. {number} — {year}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placard — museum exhibit tag below the frame */}
      <div className="ml-3 border-l-2 border-accent pl-3">
        <span className="mb-[3px] block text-[9px] uppercase tracking-[0.1em] text-ink-faint">
          No. {number} — Unarchived
        </span>
        <span className="block text-[10px] lowercase tracking-[0.06em] text-ink-muted">
          waiting to be filled
        </span>
      </div>
    </div>
  );
}

// --- Gallery row ---

export function FrameGallery({ frames = FRAMES }: { frames?: FrameData[] }) {
  return (
    <div className="flex flex-row items-start gap-4">
      {frames.map((frame) => (
        <ArchiveFrame key={frame.number} frame={frame} />
      ))}
    </div>
  );
}
