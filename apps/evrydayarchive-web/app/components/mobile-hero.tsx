'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { HERO_TEXT_VARIANTS } from '../lib/hero-copy';
import { Frame } from './frame';
import { Placard } from './placard';

const TEXT_CYCLE_MS = 11000;
const TEXT_FADE_MS = 600;

export const MobileHero = () => {
  const [textIdx, setTextIdx] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setTextVisible(false);
      const swap = setTimeout(() => {
        setTextIdx((i) => (i + 1) % HERO_TEXT_VARIANTS.length);
        setTextVisible(true);
      }, TEXT_FADE_MS);
      return () => clearTimeout(swap);
    }, TEXT_CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const variant = HERO_TEXT_VARIANTS[textIdx];

  return (
    <section className="relative px-4 pb-20 pt-10 sm:px-6 md:pt-16">
      {/* Logo — centered at top; hidden on md+ where the sticky header takes over */}
      <div className="mb-8 flex justify-center md:hidden">
        <Link href="/" aria-label="Evryday Archive Co — home">
          <Image
            src="/logo/stacked.svg"
            alt="Evryday Archive Co"
            width={140}
            height={107}
            priority
            className="dark:hidden"
          />
          <Image
            src="/logo/stacked-dark.svg"
            alt="Evryday Archive Co"
            width={140}
            height={107}
            priority
            className="hidden dark:block"
          />
        </Link>
      </div>

      {/* Fading text block — same position every cycle, variants cross-fade in place */}
      <div
        className="mb-10 min-h-[10rem] max-w-xl transition-opacity"
        style={{ opacity: textVisible ? 1 : 0, transitionDuration: `${TEXT_FADE_MS}ms` }}
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
          {variant.eyebrow}
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
          {variant.heading}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">{variant.body}</p>
      </div>

      {/* Framed hero image */}
      <div className="relative mb-10 max-w-lg">
        <Frame variant="craft" rotateDeg={-0.8}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-sun">
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-xs text-ink-faint">Hero image</p>
            </div>
          </div>
        </Frame>
        <div className="absolute -bottom-4 right-2 sm:right-6">
          <Placard title="The Archive" subtitle="Est. 2024" size="sm" />
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3">
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
    </section>
  );
};
