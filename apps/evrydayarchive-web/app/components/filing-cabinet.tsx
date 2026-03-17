'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import type { PublicReview } from '@repo/core';

import { cn } from '../lib/cn';

type FilingCabinetProps = {
  reviews: PublicReview[];
};

const formatDate = (iso: string | null): string | null => {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
      new Date(iso)
    );
  } catch {
    return null;
  }
};

// The concave corner spans fill the inward curves at the base of each active
// tab — the same trick browser chrome uses for its tab shape. Each span is
// an 8×8 block positioned just outside the tab's bottom corner; its
// box-shadow paints the concave space in the panel background colour.
const ConcaveCorners = () => (
  <>
    <span
      aria-hidden
      className="pointer-events-none absolute -left-2 bottom-0 block h-2 w-2 rounded-br-full"
      style={{ boxShadow: '4px 4px 0 0 var(--color-sun)' }}
    />
    <span
      aria-hidden
      className="pointer-events-none absolute -right-2 bottom-0 block h-2 w-2 rounded-bl-full"
      style={{ boxShadow: '-4px 4px 0 0 var(--color-sun)' }}
    />
  </>
);

// Renders the review photo at its natural aspect ratio when dimensions are
// known, falling back to a 3:2 crop otherwise.
const ReviewPhoto = ({
  image,
  sizes
}: {
  image: NonNullable<PublicReview['image']>;
  sizes: string;
}) => {
  if (image.width && image.height) {
    return (
      <div className="overflow-hidden rounded-[4px] border border-border/40 shadow-warm-sm">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="h-auto w-full"
          sizes={sizes}
        />
      </div>
    );
  }
  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-[4px] border border-border/40 shadow-warm-sm">
      <Image src={image.src} alt={image.alt} fill className="object-cover" sizes={sizes} />
    </div>
  );
};

export const FilingCabinet = ({ reviews }: FilingCabinetProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentKey, setContentKey] = useState(0);
  // 'left' = moving to a higher index (wipe reveals left→right)
  // 'right' = moving to a lower index (wipe reveals right→left)
  const [wipeDir, setWipeDir] = useState<'left' | 'right'>('left');

  if (!reviews.length) return null;

  const active = reviews[activeIndex];

  const handleTabActivate = (index: number) => {
    if (index === activeIndex) return;
    setWipeDir(index > activeIndex ? 'left' : 'right');
    setActiveIndex(index);
    setContentKey((k) => k + 1);
  };

  // ── Shared tab strip (used on both mobile and desktop) ─────────────────
  // All tabs pull down 1px (marginBottom: -1px) so every tab's background
  // lands flush on the panel surface — no gap, no horizontal seam. The
  // active tab gets extra bottom padding to remain visually taller.
  // ── Shared tab strip ───────────────────────────────────────────────────
  // No borders anywhere — depth comes from box-shadow on the panel and
  // background-colour contrast between tabs. All tabs pull down 1px so
  // their backgrounds land flush on the panel surface with no seam.
  const TabStrip = ({ className }: { className?: string }) => (
    <div className={cn('flex items-end', className)}>
      {reviews.map((review, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={review.id}
            onMouseEnter={() => handleTabActivate(i)}
            onClick={() => handleTabActivate(i)}
            style={{ marginBottom: '-1px' }}
            className={cn(
              'relative flex min-w-0 flex-shrink-0 flex-col items-start rounded-t-[16px] px-4 py-1.5 text-left transition-colors duration-standard',
              'max-w-[140px] md:max-w-[200px]',
              isActive ? 'z-10 bg-sun' : 'bg-mat-deep hover:bg-sun/70'
            )}
          >
            <span
              className={cn(
                'block truncate text-xs font-semibold leading-tight transition-colors duration-fast',
                isActive ? 'text-ink' : 'text-ink-muted'
              )}
            >
              {review.clientName}
            </span>
            {review.sessionType && (
              <span className="block truncate text-[10px] leading-tight text-ink-faint">
                {review.sessionType}
              </span>
            )}
            {isActive && <ConcaveCorners />}
          </button>
        );
      })}
    </div>
  );

  // ── Content panel ───────────────────────────────────────────────────────
  // No border — shadow-warm carries all the depth. Rounded bottom corners
  // match the tab radius so the whole shape reads as one cohesive card.
  const ContentPanel = ({ desktopLayout }: { desktopLayout: boolean }) => (
    <div className="rounded-b-[16px] rounded-tr-[16px] bg-sun shadow-warm">
      {/* Hole-punch detail — decorative only */}
      <div className="absolute left-5 top-5 flex flex-col gap-3 opacity-20">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-3 w-3 rounded-full border border-ink-faint" />
        ))}
      </div>

      <div
        key={contentKey}
        className={cn(
          contentKey === 0
            ? 'animate-fade-in'
            : wipeDir === 'left'
              ? 'animate-wipe-in-left'
              : 'animate-wipe-in-right',
          desktopLayout
            ? 'grid grid-cols-[280px_1fr] gap-8 p-8 pl-14'
            : 'flex flex-col gap-5 p-5 pl-10'
        )}
      >
        {/* Photo */}
        {active.image ? (
          desktopLayout ? (
            <div className="flex-shrink-0">
              <ReviewPhoto image={active.image} sizes="280px" />
            </div>
          ) : (
            <ReviewPhoto image={active.image} sizes="100vw" />
          )
        ) : desktopLayout ? (
          <div className="flex aspect-[3/4] w-full items-center justify-center rounded-[4px] border border-border/40 bg-mat-deep">
            <span className="text-xs text-ink-faint">No photo</span>
          </div>
        ) : null}

        {/* Quote + meta */}
        <div className={cn('flex flex-col justify-center', desktopLayout && 'py-4')}>
          <div
            aria-hidden
            className={cn(
              'mb-3 select-none font-serif leading-none text-ink-faint',
              desktopLayout ? 'text-6xl' : 'text-5xl'
            )}
          >
            &ldquo;
          </div>
          <blockquote className="mb-5">
            <p
              className={cn(
                'leading-relaxed text-ink-muted',
                desktopLayout ? 'text-lg' : 'text-base'
              )}
            >
              {active.quote}
            </p>
          </blockquote>

          <footer className="space-y-1">
            <p className="text-sm font-semibold text-ink">{active.clientName}</p>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-ink-faint">
              {active.sessionType && <span>{active.sessionType}</span>}
              {active.sessionType && active.sessionDate && <span>·</span>}
              {active.sessionDate && <span>{formatDate(active.sessionDate)}</span>}
            </div>
          </footer>

          {active.gallerySlug && (
            <Link
              href={`/portfolio/${active.gallerySlug}`}
              className="mt-5 inline-flex items-center gap-1 text-sm text-ink-faint underline-offset-4 transition-colors duration-fast hover:text-ink hover:underline"
            >
              View gallery
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile ──────────────────────────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Tab strip: horizontally scrollable, tabs snap into view */}
        <div className="relative">
          <div className="flex items-end gap-1 overflow-x-auto pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabStrip className="gap-1" />
          </div>
          {/* Right-edge fade hints at overflow */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-canvas to-transparent" />
        </div>
        <div className="relative">
          <ContentPanel desktopLayout={false} />
        </div>
      </div>

      {/* ── Desktop ─────────────────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <TabStrip className="gap-1" />
        <div className="relative">
          <ContentPanel desktopLayout={true} />
        </div>
      </div>
    </>
  );
};
