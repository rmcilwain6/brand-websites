'use client';

import { useState } from 'react';

import { WaitlistForm } from './waitlist-form';
import { RotatingText } from './rotating-text';
import { GalleryRow } from './gallery-row';

// Plain <img> — Next.js <Image> does not serve SVGs without unoptimized={true}.
const LogoAsset = ({ style }: { style?: React.CSSProperties }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/logo/horizontal.svg" alt="Evryday Archive Co." style={style} />
);

export function ComingSoonDesktop() {
  // Default to 6 (max frames) — worst-case timing ensures the form never
  // appears before the last visible frame has landed. ResizeObserver fires
  // well before the 2000ms frame-start delay, so the real count is known
  // before any animation actually runs.
  const [frameCount, setFrameCount] = useState(6);

  // Form appears after the last frame's hang-drop finishes.
  // Frame i starts at: 2000 + i*400ms, takes 1000ms → finishes at 3000 + i*400.
  // Last frame index = frameCount - 1, so: 3000 + (frameCount-1)*400 + 200 buffer.
  const formDelay = 3000 + (frameCount - 1) * 400 + 200;

  return (
    <div className="hidden h-full lg:grid" style={{ gridTemplateColumns: '33.33% 66.67%' }}>
      {/* Left panel: logo top, date + form vertically centred */}
      <div
        className="flex h-full flex-col py-16"
        style={{
          paddingLeft: 'clamp(3rem, 7vw, 7rem)',
          paddingRight: 'clamp(1.5rem, 3vw, 3rem)'
        }}
      >
        <div className="animate-fade-in" style={{ animationDuration: '600ms' }}>
          <LogoAsset style={{ width: 'clamp(160px, 14vw, 260px)' }} />
        </div>

        <div className="my-auto">
          {/* Accent bar + label — slides in from left like a placard being placed */}
          <div
            className="animate-slide-from-left"
            style={{ animationDelay: '300ms', animationDuration: '550ms' }}
          >
            <div className="mb-3 h-0.5 w-8 bg-accent" />
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
              Opening Soon
            </p>
          </div>

          {/* Date — stamps in, settles into place */}
          <p
            className="mb-3 animate-stamp-in font-semibold leading-none tracking-tight text-ink"
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 5rem)',
              animationDelay: '700ms',
              animationDuration: '550ms'
            }}
          >
            March
            <br />
            31st.
          </p>

          {/* Rotating text — fades up after the date lands */}
          <div
            className="mb-6 animate-fade-up"
            style={{ animationDelay: '1100ms', animationDuration: '450ms' }}
          >
            <RotatingText />
          </div>

          {/* Waitlist form — last to appear, after the final frame lands */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: `${formDelay}ms`, animationDuration: '450ms' }}
          >
            <WaitlistForm />
          </div>
        </div>
      </div>

      {/* Right panel: starts at canvas colour, warms to sun over the full
          animation — like gallery lights slowly heating up. */}
      <div className="animate-gallery-warm relative h-full overflow-hidden">
        <GalleryRow onCountChange={setFrameCount} />
      </div>
    </div>
  );
}
