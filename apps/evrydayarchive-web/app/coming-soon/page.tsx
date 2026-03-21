import Image from 'next/image';

import { Frame } from '../components/frame';
import { Placard } from '../components/placard';
import { WaitlistForm } from './waitlist-form';

const FrameInterior = ({ number }: { number: string }) => (
  <div className="flex h-full w-full items-end justify-end pb-1.5 pr-1.5">
    <span className="font-medium text-[9px] uppercase tracking-widest text-ink-faint opacity-40">
      No. {number}
    </span>
  </div>
);

const LogoAsset = ({
  width,
  height,
  className
}: {
  width: number;
  height: number;
  className?: string;
}) => (
  <>
    <Image
      src="/logo/stacked.svg"
      alt="Evryday Archive Co."
      width={width}
      height={height}
      className={`block dark:hidden ${className ?? ''}`}
    />
    <Image
      src="/logo/stacked-dark.svg"
      alt="Evryday Archive Co."
      width={width}
      height={height}
      className={`hidden dark:block ${className ?? ''}`}
    />
  </>
);

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen">
      {/* ── Mobile layout ─────────────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col lg:hidden">
        <div className="flex flex-1 items-center justify-center px-8 pb-8 pt-16">
          <div className="flex flex-col items-start gap-3">
            <Frame variant="gallery" mat="lg" matStyle="warm" className="h-72 w-56">
              <FrameInterior number="01" />
            </Frame>
            <Placard
              meta="Exhibition"
              title="Coming Soon"
              subtitle="Evryday Archive Co."
              size="sm"
            />
          </div>
        </div>

        <div className="px-8 pb-14 pt-4">
          <LogoAsset width={120} height={92} className="mb-8" />
          <p className="mb-8 text-xl font-semibold tracking-tight text-ink">
            Launching March 31st.
          </p>
          <WaitlistForm />
        </div>
      </div>

      {/* ── Desktop layout ─────────────────────────────────────────────────── */}
      <div className="hidden min-h-screen lg:grid" style={{ gridTemplateColumns: '44% 56%' }}>
        {/* Left panel: logo anchored top, date + form anchored bottom */}
        <div
          className="flex flex-col py-16"
          style={{
            paddingLeft: 'clamp(3rem, 7vw, 7rem)',
            paddingRight: 'clamp(1.5rem, 3vw, 3rem)'
          }}
        >
          <div className="mb-auto">
            <LogoAsset width={200} height={153} />
          </div>

          <div>
            <p className="mb-8 text-3xl font-semibold tracking-tight text-ink">
              Launching March 31st.
            </p>
            <WaitlistForm />
          </div>
        </div>

        {/* Right panel: two staggered gallery frames */}
        <div className="relative flex items-center justify-center py-20">
          <div className="relative h-[600px] w-[400px]">
            {/* Frame 1 — larger, upper right */}
            <div className="absolute right-0 top-0 flex flex-col items-start gap-3">
              <Frame variant="gallery" mat="lg" matStyle="warm" className="h-[340px] w-[264px]">
                <FrameInterior number="01" />
              </Frame>
              <Placard
                meta="Exhibition"
                title="Coming Soon"
                subtitle="Evryday Archive Co."
                size="sm"
              />
            </div>

            {/* Frame 2 — smaller, lower left */}
            <div className="absolute bottom-0 left-0 flex flex-col items-start gap-3">
              <Frame variant="gallery" mat="lg" matStyle="neutral" className="h-[260px] w-[210px]">
                <FrameInterior number="02" />
              </Frame>
              <Placard
                meta="Exhibition"
                title="Coming Soon"
                subtitle="Evryday Archive Co."
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
