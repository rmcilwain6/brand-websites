import { Frame } from '../components/frame';
import { WaitlistForm } from './waitlist-form';
import { RotatingText } from './rotating-text';
import { FrameInterior, FrameLabel } from './frame-pieces';
import { GalleryRow } from './gallery-row';

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
      <div className="flex h-full flex-col lg:hidden">
        {/* Top: single frame on the gallery wall */}
        <div className="flex flex-1 items-center justify-center bg-sun px-8">
          <div className="animate-fade-up flex flex-col gap-2">
            <Frame
              variant="gallery"
              mat="lg"
              matStyle="linen"
              className="aspect-[2/3] w-[250px] rounded-none"
              borderColor="#4A4540"
            >
              <FrameInterior number="01" catalogRef="EAC-2026-471" />
            </Frame>
            <FrameLabel frameLabel='Events' title="your favourite memory" />
          </div>
        </div>

        {/* Bottom: content panel */}
        <div className="flex flex-col justify-between px-8 pb-10 pt-8">
          <LogoAsset variant="stacked" width={100} className="mb-8" />
          <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
            <div className="mb-3 h-0.5 w-8 bg-accent" />
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
              Opening Soon
            </p>
            <p className="mb-3 text-3xl font-semibold leading-tight tracking-tight text-ink">
              March
              <br />
              31st.
            </p>
            <div className="mb-6">
              <RotatingText />
            </div>
            <WaitlistForm />
          </div>
        </div>
      </div>

      {/* ── Desktop layout ─────────────────────────────────────────────────── */}
      <div className="hidden h-full lg:grid" style={{ gridTemplateColumns: '33.33% 66.67%' }}>
        {/* Left panel: logo top, date + form vertically centred */}
        <div
          className="flex h-full flex-col py-16"
          style={{
            paddingLeft: 'clamp(3rem, 7vw, 7rem)',
            paddingRight: 'clamp(1.5rem, 3vw, 3rem)'
          }}
        >
          <div className="animate-fade-in">
            <LogoAsset variant="horizontal" style={{ width: 'clamp(160px, 14vw, 260px)' }} />
          </div>

          <div className="my-auto animate-fade-up" style={{ animationDelay: '80ms' }}>
            <div className="mb-3 h-0.5 w-8 bg-accent" />
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
              Opening Soon
            </p>
            <p
              className="mb-3 font-semibold leading-none tracking-tight text-ink"
              style={{ fontSize: 'clamp(2.2rem, 4.5vw, 5rem)' }}
            >
              March
              <br />
              31st.
            </p>
            <div className="mb-6">
              <RotatingText />
            </div>
            <WaitlistForm />
          </div>
        </div>

        {/* Right panel: responsive gallery row — GalleryRow measures this panel
            via ResizeObserver and shows as many frames as fit, with the last
            one bleeding off the right edge. */}
        <div className="relative h-full overflow-hidden bg-sun">
          <GalleryRow />
        </div>
      </div>
    </main>
  );
}
