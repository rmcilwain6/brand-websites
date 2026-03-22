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
      <div className="h-full overflow-y-auto lg:hidden">
        {/* Hero: fills most of the viewport — frame edge peeks below */}
        <div className="flex min-h-[90vh] flex-col bg-sun px-6">
          {/* paddingTop controls logo vertical position — easy to tweak */}
          <div className="animate-fade-in mb-8 flex justify-center" style={{ paddingTop: '2rem' }}>
            <LogoAsset variant="stacked" width={135} />
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
            <div className="mb-3 h-0.5 w-6 bg-accent" />
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
              Opening Soon
            </p>
            <p className="text-3xl font-semibold leading-snug tracking-tight text-ink">
              March
              <br />
              31st.
            </p>
          </div>

          {/* Rotating text — height sets where "Join the waitlist" starts */}
          <div
            className="animate-fade-up flex items-center overflow-hidden py-2"
            style={{ animationDelay: '90ms', height: '14vh' }}
          >
            <RotatingText className="flex items-start" />
          </div>

          <div className="animate-fade-up pb-12" style={{ animationDelay: '120ms' }}>
            <div className="mb-3 h-0.5 w-6 bg-accent" />
            <WaitlistForm />
          </div>
        </div>

        {/* Frames below the fold — top edge peeks at bottom of hero */}
        <div className="bg-sun px-6 pb-16 pt-0">
          <div className="animate-fade-up mb-10">
            <Frame
              variant="gallery"
              mat="lg"
              matStyle="linen"
              className="aspect-[2/3] w-full rounded-none"
              borderColor="#4A4540"
            >
              <FrameInterior number="01" catalogRef="EAC-2026-471" />
            </Frame>
            <div className="pt-3">
              <FrameLabel frameLabel="Events" title="your favourite memory" />
            </div>
          </div>
          <div className="animate-fade-up">
            <Frame
              variant="gallery"
              mat="lg"
              matStyle="linen"
              className="aspect-[2/3] w-full rounded-none"
              borderColor="#4A4540"
            >
              <FrameInterior number="02" catalogRef="EAC-2026-389" />
            </Frame>
            <div className="pt-3">
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
