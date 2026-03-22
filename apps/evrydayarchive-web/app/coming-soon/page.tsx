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
        {/* Hero: precise height so the frame strip peeks 72px below the fold */}
        <section className="flex min-h-[calc(100svh-72px)] flex-col bg-sun px-6">
          {/* Logo — top */}
          <div className="animate-fade-in flex justify-center pt-8">
            <LogoAsset variant="stacked" width={120} />
          </div>

          {/* Date + rotating text — vertically centred in the remaining space */}
          <div
            className="animate-fade-up flex flex-1 flex-col justify-center"
            style={{ animationDelay: '60ms' }}
          >
            <div className="mb-3 h-0.5 w-6 bg-accent" />
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
              Opening Soon
            </p>
            <p className="text-3xl font-semibold leading-snug tracking-tight text-ink">
              March
              <br />
              31st.
            </p>
            <div className="mt-4">
              <RotatingText />
            </div>
          </div>

          {/* Waitlist form — pinned to bottom, within thumb reach */}
          <div className="animate-fade-up pb-8" style={{ animationDelay: '120ms' }}>
            <div className="mb-3 h-0.5 w-6 bg-accent" />
            <WaitlistForm />
          </div>
        </section>

        {/* Swipeable frame strip — bg-sun matches the hero so the wall is seamless.
            Only the frames move; the background stays still. */}
        <section className="bg-sun pb-20 pt-8">
          <div
            className="flex gap-4 overflow-x-auto [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ paddingLeft: '14vw', paddingRight: '14vw' }}
          >
            {FRAME_POOL.map((f) => (
              <div
                key={f.number}
                className="flex w-[72vw] flex-shrink-0 flex-col gap-2 [scroll-snap-align:center]"
              >
                <Frame
                  variant="gallery"
                  mat="md"
                  matStyle="linen"
                  className="aspect-[2/3] w-full rounded-none"
                  borderColor="#4A4540"
                >
                  <FrameInterior number={f.number} catalogRef={f.catalogRef} />
                </Frame>
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
