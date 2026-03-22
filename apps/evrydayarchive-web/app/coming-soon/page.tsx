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
      <div className="flex h-full bg-sun lg:hidden">
        {/* Left: top 62% holds logo + date content, form sits at ~60% mark */}
        <div className="flex flex-1 flex-col">
          <div className="flex h-[62%] flex-col px-4 pt-10">
            <div className="animate-fade-in mb-6 flex justify-center">
              <LogoAsset variant="stacked" width={135} />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
              <div className="mb-2 h-0.5 w-6 bg-accent" />
              <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
                Opening Soon
              </p>
              <p className="mb-3 text-3xl font-semibold leading-tight tracking-tight text-ink">
                March
                <br />
                31st.
              </p>
              <RotatingText />
            </div>
          </div>

          <div className="animate-fade-up px-4 pb-10" style={{ animationDelay: '120ms' }}>
            <WaitlistForm />
          </div>
        </div>

        {/* Right: two frame sections, each with placard below, filling available height */}
        <div className="flex w-[58%] flex-col py-8 pr-0">
          <div
            className="animate-fade-up flex flex-1 min-h-0 flex-col"
            style={{ animationDelay: '80ms' }}
          >
            <Frame
              variant="gallery"
              mat="lg"
              matStyle="linen"
              className="min-h-0 flex-1 w-full rounded-none"
              borderColor="#4A4540"
            >
              <FrameInterior number="01" catalogRef="EAC-2026-471" />
            </Frame>
            <div className="pb-1 pt-3">
              <FrameLabel frameLabel="Events" title="your favourite memory" />
            </div>
          </div>
          <div
            className="animate-fade-up flex flex-1 min-h-0 flex-col"
            style={{ animationDelay: '140ms' }}
          >
            <Frame
              variant="gallery"
              mat="lg"
              matStyle="linen"
              className="min-h-0 flex-1 w-full rounded-none"
              borderColor="#4A4540"
            >
              <FrameInterior number="02" catalogRef="EAC-2026-389" />
            </Frame>
            <div className="pb-1 pt-3">
              <FrameLabel frameLabel="Portraits" title="a quiet afternoon" />
            </div>
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
