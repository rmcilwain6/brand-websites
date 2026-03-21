import { Frame } from '../components/frame';
import { Logo } from '../components/logo';
import { Placard } from '../components/placard';
import { WaitlistForm } from './waitlist-form';

const FrameInterior = ({ number }: { number: string }) => (
  <div className="flex h-full w-full items-end justify-end pb-1 pr-1">
    <span className="font-medium text-[9px] uppercase tracking-widest text-ink-faint opacity-50">
      No. {number}
    </span>
  </div>
);

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* ── Mobile: single frame at top ─────────────────────────────────── */}
      <div className="flex justify-center px-6 pb-8 pt-14 lg:hidden">
        <div className="flex flex-col items-start gap-3">
          <Frame variant="gallery" mat="lg" matStyle="warm" className="h-64 w-52">
            <FrameInterior number="01" />
          </Frame>
          <Placard meta="Exhibition" title="Coming Soon" subtitle="Evryday Archive Co." size="sm" />
        </div>
      </div>

      {/* ── Left panel: logo + copy + form ──────────────────────────────── */}
      <div
        className="flex flex-col justify-center px-8 py-12 lg:min-h-screen lg:w-[44%]"
        style={{ paddingLeft: 'clamp(2rem, 6vw, 6rem)', paddingRight: 'clamp(1.5rem, 4vw, 4rem)' }}
      >
        <div className="mb-10">
          <Logo />
        </div>

        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
          Kamloops &amp; British Columbia · Photography
        </p>

        <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-ink">
          Gallery under
          <br />
          construction.
        </h1>

        <p className="mb-8 text-sm leading-relaxed text-ink-muted">
          Opens <span className="font-medium text-ink">March 31st</span> — be the first to know when
          we do.
        </p>

        <WaitlistForm />
      </div>

      {/* ── Right panel: staggered frames (desktop only) ─────────────────── */}
      <div className="relative hidden flex-1 items-center justify-center lg:flex">
        <div className="relative h-[520px] w-[340px]">
          {/* Frame 1 — larger, upper right */}
          <div className="absolute right-0 top-0 flex flex-col items-start gap-3">
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

          {/* Frame 2 — smaller, lower left, slight rotation */}
          <div className="absolute bottom-0 left-0 flex flex-col items-start gap-3">
            <Frame
              variant="craft"
              mat="lg"
              matStyle="neutral"
              rotateDeg={1.2}
              className="h-52 w-40"
            >
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
    </main>
  );
}
