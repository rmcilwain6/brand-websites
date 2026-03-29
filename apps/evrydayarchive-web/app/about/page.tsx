import Image from 'next/image';
import Link from 'next/link';

import { Frame } from '../components/frame';
import { ARCHIVE_ITEMS, type ArchiveItem } from './about-data';
import { AboutDivider } from './about-divider';
import { CloseParas, PhotographerParas, WhereImFromParas, WhyThisExistsParas } from './about-copy';
import { PhotoCredit } from './photo-credit';

// ── Archive image helpers ──────────────────────────────────────────────────────

const MetaOverlay = ({ item, mobile }: { item: ArchiveItem; mobile?: boolean }) => {
  const isTop = item.metaPosition === 'top-right';
  const pos = mobile
    ? isTop
      ? 'absolute top-3 right-3'
      : 'absolute bottom-3 right-3'
    : isTop
      ? 'absolute top-2 right-2'
      : 'absolute bottom-2 right-2';
  const color = item.metaDark ? 'text-[#2b2b2b]' : 'text-[#b0a898]';
  return (
    <div className={`${pos} text-right`}>
      <p className={`font-mono text-[9px] ${color}`}>{item.meta[0]}</p>
      <p className={`font-mono text-[9px] ${color}`}>{item.meta[1]}</p>
    </div>
  );
};

const MobileImg = ({ item, sizes = '100vw' }: { item: ArchiveItem; sizes?: string }) => (
  <div className="relative w-full" style={{ aspectRatio: item.aspect }}>
    <Image src={item.src} alt={item.alt} fill className="object-cover" sizes={sizes} />
    <div className="absolute bottom-3 left-3">
      <PhotoCredit credit={item.credit} href={item.creditHref} />
    </div>
    <MetaOverlay item={item} mobile />
  </div>
);

const DesktopImg = ({
  item,
  sizes,
  mat = 'sm'
}: {
  item: ArchiveItem;
  sizes?: string;
  mat?: 'sm' | 'md' | 'lg';
}) => (
  <Frame variant="gallery" mat={mat} matStyle="linen">
    <div className="relative w-full" style={{ aspectRatio: item.aspect }}>
      <Image src={item.src} alt={item.alt} fill className="object-cover" sizes={sizes} />
      <div className="absolute bottom-2 left-2">
        <PhotoCredit credit={item.credit} href={item.creditHref} />
      </div>
      <MetaOverlay item={item} />
    </div>
  </Frame>
);

// ── Archive grid rows ──────────────────────────────────────────────────────────

const ArchiveLandscape = ({
  item,
  first = false,
  mobile
}: {
  item: ArchiveItem;
  first?: boolean;
  mobile: boolean;
}) => (
  <div className={!first && mobile ? 'mt-7' : ''}>
    {mobile ? (
      <MobileImg item={item} />
    ) : (
      <DesktopImg item={item} sizes="(min-width: 1024px) 768px, 90vw" />
    )}
    <p
      className={`font-mono text-[11px] italic text-[#9a9088] dark:text-ink-faint ${mobile ? 'mt-3 px-6' : 'mt-3'}`}
    >
      {item.caption}
    </p>
  </div>
);

const ArchivePortraitPair = ({
  left,
  right,
  leftOffset = false,
  rightOffset = false,
  mobile
}: {
  left: ArchiveItem;
  right: ArchiveItem;
  leftOffset?: boolean;
  rightOffset?: boolean;
  mobile: boolean;
}) => (
  <div className={mobile ? 'mt-7 grid grid-cols-2 gap-[10px] px-6' : 'grid grid-cols-2 gap-5'}>
    <div className={leftOffset ? (mobile ? '-mt-4' : '-mt-5') : ''}>
      {mobile ? (
        <MobileImg item={left} sizes="50vw" />
      ) : (
        <DesktopImg item={left} sizes="(min-width: 1024px) 380px, 45vw" />
      )}
      <p
        className={`font-mono italic text-[#9a9088] dark:text-ink-faint ${mobile ? 'mt-2 text-[10px]' : 'mt-2.5 text-[11px]'}`}
      >
        {left.caption}
      </p>
    </div>
    <div className={rightOffset ? (mobile ? 'mt-8' : 'mt-10') : ''}>
      {mobile ? (
        <MobileImg item={right} sizes="50vw" />
      ) : (
        <DesktopImg item={right} sizes="(min-width: 1024px) 380px, 45vw" />
      )}
      <p
        className={`font-mono italic text-[#9a9088] dark:text-ink-faint ${mobile ? 'mt-2 text-[10px]' : 'mt-2.5 text-[11px]'}`}
      >
        {right.caption}
      </p>
    </div>
  </div>
);

const ArchiveGrid = ({ mobile }: { mobile: boolean }) => {
  const label = (
    <p
      className={`text-[13px] uppercase tracking-[0.1em] text-[#a09a8e] dark:text-ink-faint ${mobile ? 'mb-7 px-6' : 'mb-8'}`}
    >
      A glimpse into my Archive
    </p>
  );

  const rows = (
    <>
      <ArchiveLandscape item={ARCHIVE_ITEMS[0]} first mobile={mobile} />
      <ArchivePortraitPair
        left={ARCHIVE_ITEMS[1]}
        right={ARCHIVE_ITEMS[2]}
        rightOffset
        mobile={mobile}
      />
      <ArchiveLandscape item={ARCHIVE_ITEMS[3]} mobile={mobile} />
      <ArchiveLandscape item={ARCHIVE_ITEMS[4]} mobile={mobile} />
      <ArchivePortraitPair
        left={ARCHIVE_ITEMS[5]}
        right={ARCHIVE_ITEMS[6]}
        leftOffset
        mobile={mobile}
      />
      <ArchiveLandscape item={ARCHIVE_ITEMS[7]} mobile={mobile} />
    </>
  );

  if (mobile) {
    return (
      <section>
        {label}
        {rows}
      </section>
    );
  }

  return (
    <section className="px-10 pb-4 lg:px-16">
      <div className="mx-auto max-w-3xl">
        {label}
        <div className="space-y-8">{rows}</div>
      </div>
    </section>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="bg-canvas">
      <h1 className="sr-only">About Reed — Evryday Archive Co</h1>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE LAYOUT — hidden on md and above
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* ── Opening ────────────────────────────────────────────────── */}
        <section className="px-6 py-9">
          <p className="mb-5 text-[13px] uppercase tracking-[0.1em] text-[#a09a8e] dark:text-ink-faint">
            About
          </p>
          <p className="text-[22px] leading-[1.45] text-[#2b2b2b] dark:text-ink">
            Most people book a photographer a handful of days in their whole life. A wedding. A
            graduation. Maybe an engagement. That&apos;s{' '}
            <span className="text-accent">a lot of life left undocumented.</span>
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-[#5a5450] dark:text-ink-muted">
            I started Evryday Archive Co because I think the everyday is worth just as much.
          </p>
        </section>

        {/* ── Portrait (17) ──────────────────────────────────────────── */}
        <div className="relative aspect-[3/4] w-full">
          <Image
            src="/images/about/about-page-17.webp"
            alt="Reed in the field, Kamloops BC"
            fill
            className="object-cover"
            sizes="100vw"
            quality={90}
          />
          <div className="absolute bottom-3 left-3">
            <PhotoCredit credit="Photo taken by Carolyn Dahl" />
          </div>
          <div className="absolute bottom-3 right-3 text-right">
            <p className="font-mono text-[9px] text-[#b0a898]">Kamloops, BC</p>
            <p className="font-mono text-[9px] text-[#b0a898]">Jan 2026</p>
          </div>
        </div>

        <AboutDivider />

        {/* ── Photographer ───────────────────────────────────────────── */}
        <section className="px-6">
          <p className="mb-5 text-[13px] uppercase tracking-[0.1em] text-[#a09a8e] dark:text-ink-faint">
            The Photographer: Reed McIlwain
          </p>
          <div className="space-y-4 text-sm leading-[1.75] text-[#4a4540] dark:text-ink-muted">
            <PhotographerParas />
          </div>
        </section>

        {/* ── Photo 10 ───────────────────────────────────────────────── */}
        <div className="relative mt-7 aspect-[3/2] w-full">
          <Image
            src="/images/about/about-page-10.webp"
            alt="Reed looking at previews on his camera at the Big White Winter Rally in December 2025"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute bottom-3 left-3">
            <PhotoCredit
              credit="Photo by Angus Tsang"
              href="https://www.instagram.com/beef_angus/"
            />
          </div>
          <div className="absolute bottom-3 right-3 text-right">
            <p className="font-mono text-[9px] text-[#b0a898]">Big White Winter Rally</p>
            <p className="font-mono text-[9px] text-[#b0a898]">Dec 2025</p>
          </div>
        </div>

        {/* ── Where I'm from ─────────────────────────────────────────── */}
        <section className="px-6 py-7">
          <div className="space-y-4 text-sm leading-[1.75] text-[#4a4540] dark:text-ink-muted">
            <WhereImFromParas />
          </div>
        </section>

        {/* ── Photo 15 ───────────────────────────────────────────────── */}
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/images/about/about-page-15.webp"
            alt="Victoria, BC, Sep 2023"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute bottom-3 left-3 z-10">
            <PhotoCredit credit="Photo taken by Emma Tarasoff" />
          </div>
          <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center">
            <p className="font-mono text-[9px] text-[#2b2b2b]">Victoria, BC · Sep 2023</p>
          </div>
        </div>

        <AboutDivider />

        {/* ── Archive ────────────────────────────────────────────────── */}
        <ArchiveGrid mobile />

        <AboutDivider />

        {/* ── Why this exists ────────────────────────────────────────── */}
        <section className="px-6">
          <p className="mb-5 text-[13px] uppercase tracking-[0.1em] text-[#a09a8e] dark:text-ink-faint">
            Why this exists
          </p>
          <div className="space-y-4 text-sm leading-[1.75] text-[#4a4540] dark:text-ink-muted">
            <WhyThisExistsParas />
          </div>
          <div className="relative -mx-6 mt-7 aspect-[3/2] w-[calc(100%+3rem)]">
            <Image
              src="/images/about/about-page-18.webp"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute bottom-3 left-3">
              <PhotoCredit credit="Photo taken by Carolyn Dahl" />
            </div>
            <div className="absolute bottom-3 right-3 text-right">
              <p className="font-mono text-[9px] text-[#2b2b2b]">Kamloops, BC</p>
              <p className="font-mono text-[9px] text-[#2b2b2b]">Jan 2026</p>
            </div>
          </div>
        </section>

        <AboutDivider />

        {/* ── Close / CTA ────────────────────────────────────────────── */}
        <section className="px-6 text-center">
          <div className="space-y-6 text-sm leading-[1.75] text-[#4a4540] dark:text-ink-muted">
            <CloseParas />
          </div>
          <p className="mt-4 text-[12px] text-[#8a8078] dark:text-ink-faint">
            If you&apos;ve been thinking about it, reach out. No commitment in asking.
          </p>
          <div className="mt-6">
            <Link
              href="/inquire"
              className="block w-full rounded bg-accent py-3 text-[13px] font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Get in touch
            </Link>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT — hidden below md
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* ── Hero: Opening + Portrait ───────────────────────────────── */}
        <section className="grid md:grid-cols-2">
          <div className="flex flex-col justify-center px-14 py-12 lg:px-20 lg:py-16">
            <p className="mb-8 text-[13px] uppercase tracking-[0.1em] text-[#a09a8e] dark:text-ink-faint">
              About
            </p>
            <p className="text-[26px] leading-[1.45] text-[#2b2b2b] dark:text-ink lg:text-[30px]">
              Most people book a photographer a handful of days in their whole life. A wedding. A
              graduation. Maybe an engagement. That&apos;s{' '}
              <span className="text-accent">a lot of life left undocumented.</span>
            </p>
            <p className="mt-6 text-lg leading-relaxed text-[#5a5450] dark:text-ink-muted">
              I started Evryday Archive Co because I think the everyday is worth just as much.
            </p>
          </div>

          <div className="flex items-center justify-center px-8 py-8 lg:px-10 lg:py-10">
            <div className="w-full max-w-xl">
              <Frame variant="gallery" mat="lg" matStyle="linen">
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src="/images/about/about-page-17.webp"
                    alt="Reed in the field, Kamloops BC"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 960px, 90vw"
                  />
                  <div className="absolute bottom-2 left-2">
                    <PhotoCredit credit="Photo taken by Carolyn Dahl" />
                  </div>
                  <div className="absolute bottom-2 right-2 text-right">
                    <p className="font-mono text-[9px] text-[#b0a898]">Kamloops, BC</p>
                    <p className="font-mono text-[9px] text-[#b0a898]">Jan 2026</p>
                  </div>
                </div>
              </Frame>
            </div>
          </div>
        </section>

        {/* ── Photo 10 (left) + Photographer text (right) ────────────── */}
        <section className="grid md:grid-cols-2">
          {/* Left — photo */}
          <div className="flex items-center justify-center px-8 py-8 lg:px-10 lg:py-10">
            <div className="w-full max-w-xl">
              <Frame variant="gallery" mat="md" matStyle="linen">
                <div className="relative aspect-[4/5] lg:aspect-[5/4] w-full">
                  <Image
                    src="/images/about/about-page-10.webp"
                    alt="Reed, Big White Winter Rally"
                    fill
                    className="object-cover"
                    style={{ objectPosition: '15% center' }}
                    sizes="(min-width: 1024px) 576px, 90vw"
                  />
                  <div className="absolute bottom-2 left-2">
                    <PhotoCredit
                      credit="Photo by Angus Tsang"
                      href="https://www.instagram.com/beef_angus/"
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 text-right">
                    <p className="font-mono text-[9px] text-[#b0a898]">Big White Winter Rally</p>
                    <p className="font-mono text-[9px] text-[#b0a898]">Dec 2025</p>
                  </div>
                </div>
              </Frame>
            </div>
          </div>

          {/* Right — text */}
          <div className="flex flex-col justify-center px-14 py-12 lg:px-20 lg:py-16">
            <p className="mb-7 text-[13px] uppercase tracking-[0.1em] text-[#a09a8e] dark:text-ink-faint">
              The Photographer: Reed McIlwain
            </p>
            <div className="space-y-4 text-base leading-[1.75] text-[#4a4540] dark:text-ink-muted">
              <PhotographerParas />
            </div>
          </div>
        </section>

        {/* ── Where I'm from text (left) + Photo 15 (right) ─────────── */}
        <section className="grid md:grid-cols-2">
          {/* Left — text */}
          <div className="flex flex-col justify-center px-14 py-12 lg:px-20 lg:py-16">
            <div className="space-y-4 text-base leading-[1.75] text-[#4a4540] dark:text-ink-muted">
              <WhereImFromParas />
            </div>
          </div>

          {/* Right — photo */}
          <div className="flex items-center justify-center px-8 py-8 lg:px-10 lg:py-10">
            <div className="w-full max-w-xl">
              <Frame variant="gallery" mat="md" matStyle="linen">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/about/about-page-15.webp"
                    alt="Victoria, BC"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 576px, 90vw"
                  />
                  <div className="absolute bottom-2 left-2">
                    <PhotoCredit credit="Photo taken by Emma Tarasoff" />
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <p className="font-mono text-[9px] text-[#2b2b2b]">Victoria, BC · Sep 2023</p>
                  </div>
                </div>
              </Frame>
            </div>
          </div>
        </section>

        <AboutDivider />

        {/* ── Archive ────────────────────────────────────────────────── */}
        <ArchiveGrid mobile={false} />

        <AboutDivider />

        {/* ── Photo 18 (left) + Why this exists text (right) ────────── */}
        <section className="grid md:grid-cols-2">
          {/* Left — text */}
          <div className="flex flex-col justify-center px-14 py-12 lg:px-20 lg:py-16">
            <p className="mb-7 text-[13px] uppercase tracking-[0.1em] text-[#a09a8e] dark:text-ink-faint">
              Why this exists
            </p>
            <div className="space-y-4 text-base leading-[1.75] text-[#4a4540] dark:text-ink-muted">
              <WhyThisExistsParas />
            </div>
          </div>
          {/* Right — photo */}
          <div className="flex items-center justify-center px-8 py-8 lg:px-10 lg:py-10">
            <div className="w-full max-w-xl">
              <Frame variant="gallery" mat="md" matStyle="linen">
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src="/images/about/about-page-18.webp"
                    alt=""
                    fill
                    className="object-cover"
                    style={{ objectPosition: '75% center' }}
                    sizes="(min-width: 1024px) 576px, 90vw"
                  />
                  <div className="absolute bottom-2 left-2">
                    <PhotoCredit credit="Photo taken by Carolyn Dahl" />
                  </div>
                  <div className="absolute bottom-2 right-2 text-right">
                    <p className="font-mono text-[9px] text-[#b0a898]">Kamloops, BC</p>
                    <p className="font-mono text-[9px] text-[#b0a898]">Jan 2026</p>
                  </div>
                </div>
              </Frame>
            </div>
          </div>
        </section>

        <AboutDivider />

        {/* ── Close / CTA ────────────────────────────────────────────── */}
        <section className="px-10 pb-20 pt-10 text-center lg:px-16">
          <div className="mx-auto max-w-xl">
            <div className="space-y-4 text-base leading-[1.75] text-[#4a4540] dark:text-ink-muted">
              <CloseParas />
            </div>
            <p className="mt-4 text-[12px] text-[#8a8078] dark:text-ink-faint">
              If you&apos;ve been thinking about it, reach out. No commitment in asking.
            </p>
            <div className="mt-8">
              <Link
                href="/inquire"
                className="inline-block rounded bg-accent px-8 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
