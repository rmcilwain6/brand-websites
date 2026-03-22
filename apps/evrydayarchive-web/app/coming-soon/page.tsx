import { Frame } from '../components/frame';
import { WaitlistForm } from './waitlist-form';
import { RotatingText } from './rotating-text';
import { FrameInterior, FrameLabel } from './frame-pieces';
import { ComingSoonDesktop } from './coming-soon-desktop';
import { FRAME_POOL } from './frames-data';

// Plain <img> — Next.js <Image> does not serve SVGs without unoptimized={true}.
const LogoAsset = ({
  width,
  style,
  className,
  variant = 'stacked'
}: {
  width?: number;
  style?: React.CSSProperties;
  className?: string;
  variant?: 'stacked' | 'horizontal';
}) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={`/logo/${variant}.svg`}
    alt="Evryday Archive Co."
    width={width}
    style={style}
    className={className}
  />
);

export default function ComingSoonPage() {
  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* ── Mobile layout ─────────────────────────────────────────────────── */}
      <div className="h-full overflow-y-auto lg:hidden">
        {/* Hero: clamp-based sizing so every phone uses its full canvas.
            min-h leaves 72px visible so the frame strip peeks below the fold. */}
        <section
          className="flex flex-col bg-sun"
          style={{
            minHeight: 'min(calc(100svh - 72px), 680px)',
            paddingLeft: 'clamp(1.25rem, 6vw, 2.25rem)',
            paddingRight: 'clamp(1.25rem, 6vw, 2.25rem)'
          }}
        >
          {/* Logo — top third */}
          <div
            className="animate-fade-in flex justify-center"
            style={{ paddingTop: 'clamp(1.75rem, 5.5vh, 3.5rem)' }}
          >
            <LogoAsset variant="stacked" style={{ width: 'clamp(150px, 44vw, 220px)' }} />
          </div>

          {/* Date + rotating text — vertically centred */}
          <div
            className="animate-fade-up flex flex-1 flex-col justify-center"
            style={{ animationDelay: '60ms' }}
          >
            <div className="mb-3 h-0.5 bg-accent" style={{ width: 'clamp(1.25rem, 5vw, 2rem)' }} />
            <p
              className="mb-2 font-medium uppercase tracking-widest text-ink-faint"
              style={{ fontSize: 'clamp(9px, 2.5vw, 11px)' }}
            >
              Opening Soon
            </p>
            <p
              className="font-semibold leading-snug tracking-tight text-ink"
              style={{ fontSize: 'clamp(1.85rem, 9vw, 2.9rem)' }}
            >
              March
              <br />
              31st.
            </p>
            <div style={{ marginTop: 'clamp(0.75rem, 2.5vh, 1.5rem)' }}>
              <RotatingText />
            </div>
          </div>

          {/* Waitlist form — pinned to bottom, within thumb reach */}
          <div
            className="animate-fade-up"
            style={{
              animationDelay: '120ms',
              paddingBottom: 'clamp(1.75rem, 5.5vh, 3rem)'
            }}
          >
            <div className="mb-3 h-0.5 bg-accent" style={{ width: 'clamp(1.25rem, 5vw, 2rem)' }} />
            <WaitlistForm />
          </div>
        </section>

        {/* Swipeable frame strip — bg-sun matches the hero so the wall is one
            continuous surface. Only the frames move; the background stays still.
            Each frame has its own width + aspect ratio for organic variety. */}
        <section className="bg-sun pb-20 pt-8">
          <div
            className="flex gap-4 overflow-x-auto [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ paddingLeft: '14vw', paddingRight: '14vw' }}
          >
            {FRAME_POOL.map((f) => (
              <div
                key={f.number}
                className="flex flex-shrink-0 flex-col gap-2 [scroll-snap-align:center]"
                style={{ width: `${f.mobileWidthVw}vw` }}
              >
                {/* Wrapper sets the aspect ratio; Frame fills it with h-full */}
                <div style={{ aspectRatio: f.mobileAspect }}>
                  <Frame
                    variant="gallery"
                    mat="md"
                    matStyle="linen"
                    className="h-full w-full rounded-none"
                    borderColor="#4A4540"
                  >
                    <FrameInterior number={f.number} catalogRef={f.catalogRef} />
                  </Frame>
                </div>
                <FrameLabel frameLabel={f.label} title={f.title} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Desktop layout ─────────────────────────────────────────────────── */}
      <ComingSoonDesktop />
    </main>
  );
}
