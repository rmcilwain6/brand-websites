'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useFeatureFlag } from '../lib/use-feature-flag';
import { Frame } from './frame';
import { Placard } from './placard';
import { RollingHero } from './rolling-hero';
import { RollingHeroFixedText } from './rolling-hero-fixed-text';

export const HeroSection = () => {
  const rollingHero = useFeatureFlag('ROLLING_HERO');
  const fixedText = useFeatureFlag('ROLLING_HERO_FIXED_TEXT');

  // ROLLING_HERO_FIXED_TEXT takes precedence over ROLLING_HERO when both are on.
  const activeVariant = fixedText ? 'fixed-text' : rollingHero ? 'rolling' : 'classic';

  return (
    <>
      {/* Desktop (lg+): feature-flagged hero variants */}
      {activeVariant === 'fixed-text' && (
        <div className="hidden lg:block">
          <RollingHeroFixedText />
        </div>
      )}
      {activeVariant === 'rolling' && (
        <div className="hidden lg:block">
          <RollingHero />
        </div>
      )}
      {/* Classic hero: always on mobile/tablet; fallback on desktop when no flag is active */}
      <div className={activeVariant !== 'classic' ? 'lg:hidden' : undefined}>
        <ClassicHero />
      </div>
    </>
  );
};

// ── Classic (original) hero ───────────────────────────────────────────────────

const ClassicHero = () => (
  <section className="relative px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:px-8">
    <div className="mx-auto max-w-5xl">
      {/* Mobile logo — centered at top; desktop has logo in the sticky header */}
      <div className="mb-8 flex justify-center md:hidden">
        <Link href="/" aria-label="Evryday Archive Co — home">
          <Image
            src="/logo/stacked.svg"
            alt="Evryday Archive Co"
            width={100}
            height={76}
            priority
            className="dark:hidden"
          />
          <Image
            src="/logo/stacked-dark.svg"
            alt="Evryday Archive Co"
            width={100}
            height={76}
            priority
            className="hidden dark:block"
          />
        </Link>
      </div>

      {/* Stage 1: exhibit text (appears first) */}
      <div className="animate-fade-up mb-10 max-w-xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
          Ottawa–Gatineau · Photography
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Quiet days,
          <br />
          carefully documented.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
          A studio practice rooted in intention — capturing everyday life with honesty and care.
        </p>
      </div>

      {/* Stage 2: framed hero image (arrives after text) */}
      <div className="animate-fade-up relative mb-10 max-w-lg" style={{ animationDelay: '180ms' }}>
        <Frame variant="craft" rotateDeg={-0.8}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-sun">
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-xs text-ink-faint">Hero image</p>
            </div>
          </div>
        </Frame>

        {/* Anchored placard at bottom-right of the frame */}
        <div className="absolute -bottom-4 right-2 sm:right-6">
          <Placard title="The Archive" subtitle="Est. 2024" size="sm" />
        </div>
      </div>

      {/* Stage 3: CTA row (appears last) */}
      <div
        className="animate-fade-in flex flex-wrap items-center gap-3"
        style={{ animationDelay: '400ms' }}
      >
        <Link
          href="/inquire"
          className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Inquire
        </Link>
        <Link
          href="/packages"
          className="rounded-card border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Explore packages
        </Link>
      </div>
    </div>
  </section>
);
