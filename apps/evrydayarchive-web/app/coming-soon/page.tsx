import { Frame } from '../components/frame';
import { WaitlistForm } from './waitlist-form';
import { RotatingText } from './rotating-text';
import { FrameInterior, FrameLabel } from './frame-pieces';
import { ComingSoonDesktop } from './coming-soon-desktop';

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

        {/* Frames below the fold — tight gallery grid */}
        <div className="bg-sun px-4 pb-16 pt-0">
          <div className="grid grid-cols-2 gap-2">
            {/* Row 1: two portraits */}
            <div>
              <Frame
                variant="gallery"
                mat="md"
                matStyle="linen"
                className="aspect-[2/3] w-full rounded-none"
                borderColor="#4A4540"
              >
                <FrameInterior number="01" catalogRef="EAC-2026-471" />
              </Frame>
              <div className="pt-2">
                <FrameLabel frameLabel="Events" title="your favourite memory" />
              </div>
            </div>
            <div>
              <Frame
                variant="gallery"
                mat="md"
                matStyle="linen"
                className="aspect-[2/3] w-full rounded-none"
                borderColor="#4A4540"
              >
                <FrameInterior number="02" catalogRef="EAC-2026-389" />
              </Frame>
              <div className="pt-2">
                <FrameLabel frameLabel="Portraits" title="a quiet afternoon" />
              </div>
            </div>

            {/* Row 2: landscape spanning full width */}
            <div className="col-span-2">
              <Frame
                variant="gallery"
                mat="md"
                matStyle="linen"
                className="aspect-[16/9] w-full rounded-none"
                borderColor="#4A4540"
              >
                <FrameInterior number="03" catalogRef="EAC-2026-512" />
              </Frame>
              <div className="pt-2">
                <FrameLabel frameLabel="Family" title="sunday morning" />
              </div>
            </div>

            {/* Row 3: square + portrait */}
            <div>
              <Frame
                variant="gallery"
                mat="md"
                matStyle="linen"
                className="aspect-square w-full rounded-none"
                borderColor="#4A4540"
              >
                <FrameInterior number="04" catalogRef="EAC-2026-203" />
              </Frame>
              <div className="pt-2">
                <FrameLabel frameLabel="Lifestyle" title="the small hours" />
              </div>
            </div>
            <div>
              <Frame
                variant="gallery"
                mat="md"
                matStyle="linen"
                className="aspect-[2/3] w-full rounded-none"
                borderColor="#4A4540"
              >
                <FrameInterior number="05" catalogRef="EAC-2026-318" />
              </Frame>
              <div className="pt-2">
                <FrameLabel frameLabel="Weddings" title="forever begins here" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop layout ─────────────────────────────────────────────────── */}
      <ComingSoonDesktop />
    </main>
  );
}
