'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { type GalleryDetail } from '@repo/core';

import { cn } from '../lib/cn';
import { Frame } from './frame';
import { Placard } from './placard';

// ── Local type aliases ──────────────────────────────────────────────────────

type GalleryImage = GalleryDetail['images'][number];
type Progress = { current: number; total: number };
type PanelRefSetter = (el: HTMLDivElement | null) => void;

// ── GalleryViewer ───────────────────────────────────────────────────────────

type GalleryViewerProps = {
  gallery: GalleryDetail;
  /** Panel index to show on first render, sourced from the ?p= search param. */
  initialPanel?: number;
};

/**
 * Full-screen, snap-scroll gallery viewer.
 *
 * Panel layout:
 *   0             — OpeningPanel (exhibit intro)
 *   1 … N         — PhotoPanel  (one per image)
 *   N+1           — ClosingPanel (exhibit outro + CTAs)
 *
 * Keyboard: ArrowDown / Space / PageDown → next panel
 *           ArrowUp  / PageUp             → prev panel
 *           Escape                         → exit Frameless mode
 *
 * URL: synced via window.history.replaceState(?p=N) — no history push so
 *      the browser back button navigates cleanly to the referring page.
 */
export const GalleryViewer = ({ gallery, initialPanel = 0 }: GalleryViewerProps) => {
  const { images } = gallery;
  const totalPanels = images.length + 2; // opening + N photos + closing

  // Panel DOM refs indexed 0 … totalPanels-1
  const panelRefs = useRef<(HTMLDivElement | null)[]>(Array(totalPanels).fill(null));

  // Keep a ref mirror of currentPanel for use inside keydown handler
  // (avoids stale closure without adding currentPanel as effect dependency)
  const currentPanelRef = useRef(initialPanel);

  const [currentPanel, setCurrentPanel] = useState(initialPanel);
  const [isFrameless, setIsFrameless] = useState(false);
  // Controls overlay visibility inside Frameless mode (tap-to-toggle)
  const [framelessControls, setFramelessControls] = useState(true);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Scroll to initial panel on first mount ────────────────────────────────
  useEffect(() => {
    if (initialPanel > 0) {
      panelRefs.current[initialPanel]?.scrollIntoView({ behavior: 'instant' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keep ref in sync ──────────────────────────────────────────────────────
  useEffect(() => {
    currentPanelRef.current = currentPanel;
  }, [currentPanel]);

  // ── IntersectionObserver — detect active panel ────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = panelRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setCurrentPanel(idx);
          }
        }
      },
      { threshold: 0.5 }
    );

    panelRefs.current.forEach((p) => {
      if (p) observer.observe(p);
    });

    return () => observer.disconnect();
    // Re-run only if the number of images changes (e.g. live refresh in dev)
  }, [images.length]);

  // ── URL sync (replaceState — no history push) ─────────────────────────────
  useEffect(() => {
    const url =
      currentPanel === 0
        ? window.location.pathname
        : `${window.location.pathname}?p=${currentPanel}`;
    window.history.replaceState(null, '', url);
  }, [currentPanel]);

  // ── Navigate to a panel ───────────────────────────────────────────────────
  const goToPanel = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(totalPanels - 1, index));
      panelRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth' });
    },
    [totalPanels]
  );

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        goToPanel(currentPanelRef.current + 1);
      } else if (['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        goToPanel(currentPanelRef.current - 1);
      } else if (e.key === 'Escape' && isFrameless) {
        setIsFrameless(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goToPanel, isFrameless]);

  // ── Stable per-panel ref setters ─────────────────────────────────────────
  // useMemo ensures each setter function is stable across re-renders so React
  // doesn't unnecessarily call the old cleanup on every render cycle.
  const panelRefSetters = useMemo<PanelRefSetter[]>(
    () =>
      Array.from({ length: totalPanels }, (_, i) => (el: HTMLDivElement | null) => {
        panelRefs.current[i] = el;
      }),
    [totalPanels]
  );

  // Photo index: which image in gallery.images[] corresponds to currentPanel
  const photoIndex = currentPanel - 1;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-scroll overscroll-none snap-y snap-mandatory bg-canvas scrollbar-none"
      aria-label={`${gallery.title} — gallery viewer`}
    >
      {/* ── Opening panel ─────────────────────────────────────────────────── */}
      <OpeningPanel
        panelRef={panelRefSetters[0]}
        gallery={gallery}
        progress={{ current: 1, total: totalPanels }}
        onStart={() => goToPanel(1)}
      />

      {/* ── Photo panels ──────────────────────────────────────────────────── */}
      {images.map((image, i) => (
        <PhotoPanel
          key={image.id}
          panelRef={panelRefSetters[i + 1]}
          image={image}
          galleryTitle={gallery.title}
          isFrameless={isFrameless}
          framelessControlsVisible={framelessControls}
          onToggleFramelessControls={() => setFramelessControls((v) => !v)}
          onEnterFrameless={() => {
            setIsFrameless(true);
            setFramelessControls(true);
          }}
          onExitFrameless={() => {
            setIsFrameless(false);
            setFramelessControls(true);
          }}
          onPrev={() => goToPanel(currentPanel - 1)}
          onNext={() => goToPanel(currentPanel + 1)}
          progress={{ current: i + 2, total: totalPanels }}
          // Eager-load: current panel ± 1; lazy elsewhere
          loadEager={Math.abs(i - photoIndex) <= 1}
        />
      ))}

      {/* ── Closing panel ─────────────────────────────────────────────────── */}
      <ClosingPanel
        panelRef={panelRefSetters[totalPanels - 1]}
        gallery={gallery}
        progress={{ current: totalPanels, total: totalPanels }}
        onBack={() => goToPanel(totalPanels - 2)}
      />
    </div>
  );
};

// ── OpeningPanel ─────────────────────────────────────────────────────────────

type OpeningPanelProps = {
  panelRef: PanelRefSetter;
  gallery: GalleryDetail;
  progress: Progress;
  onStart: () => void;
};

const OpeningPanel = ({ panelRef, gallery, progress, onStart }: OpeningPanelProps) => (
  <div
    ref={panelRef}
    className="relative flex h-[100svh] snap-start flex-col"
    aria-label="Exhibit introduction"
  >
    {/* Top bar */}
    <div className="flex flex-none items-center px-5 pt-5 sm:px-8">
      <Link
        href="/portfolio"
        className="text-sm text-ink-faint transition-colors duration-fast hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
      >
        ← Portfolio
      </Link>
    </div>

    {/* Main content */}
    <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
      {gallery.location && (
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
          {gallery.location}
        </p>
      )}
      <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
        {gallery.title}
      </h1>
      {gallery.description && (
        <p className="mb-8 max-w-sm text-base leading-relaxed text-ink-muted sm:max-w-md sm:text-lg">
          {gallery.description}
        </p>
      )}
      <button
        type="button"
        onClick={onStart}
        className="self-start rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        Start exhibit →
      </button>
    </div>

    {/* Bottom chrome */}
    <div className="flex flex-none items-center justify-between px-5 pb-5 sm:px-8">
      <ProgressLabel progress={progress} />
      <button
        type="button"
        onClick={onStart}
        aria-label="Scroll to first photo"
        className="flex h-9 w-9 items-center justify-center rounded-card text-ink-faint transition-colors duration-fast hover:bg-sun hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <ChevronDownIcon />
      </button>
    </div>
  </div>
);

// ── PhotoPanel ────────────────────────────────────────────────────────────────

type PhotoPanelProps = {
  panelRef: PanelRefSetter;
  image: GalleryImage;
  galleryTitle: string;
  isFrameless: boolean;
  framelessControlsVisible: boolean;
  onToggleFramelessControls: () => void;
  onEnterFrameless: () => void;
  onExitFrameless: () => void;
  onPrev: () => void;
  onNext: () => void;
  progress: Progress;
  loadEager: boolean;
};

const PhotoPanel = ({
  panelRef,
  image,
  galleryTitle,
  isFrameless,
  framelessControlsVisible,
  onToggleFramelessControls,
  onEnterFrameless,
  onExitFrameless,
  onPrev,
  onNext,
  progress,
  loadEager
}: PhotoPanelProps) => (
  <div
    ref={panelRef}
    className="relative flex h-[100svh] snap-start flex-col"
    aria-label={`Photo ${progress.current - 1}: ${image.alt}`}
  >
    {isFrameless ? (
      // ── Frameless (immersive) view ─────────────────────────────────────
      <button
        type="button"
        className="relative flex h-full w-full flex-col cursor-default"
        onClick={onToggleFramelessControls}
        aria-label={framelessControlsVisible ? 'Hide controls' : 'Show controls'}
      >
        {/* Full-bleed image */}
        <div className="relative flex-1 bg-black">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-contain"
            loading={loadEager ? 'eager' : 'lazy'}
            sizes="100vw"
          />
        </div>

        {/* Overlay chrome — visible on tap */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex flex-col',
            'transition-opacity duration-standard',
            framelessControlsVisible ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={!framelessControlsVisible}
        >
          {/* Top bar */}
          <div
            className="pointer-events-auto flex flex-none items-center justify-between px-5 pt-5 sm:px-8"
            style={{
              background:
                'linear-gradient(to bottom, var(--color-canvas-overlay) 0%, transparent 100%)'
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExitFrameless();
              }}
              className="flex items-center gap-1.5 rounded-card px-2 py-1 text-sm text-ink transition-colors duration-fast hover:bg-sun focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              aria-label="Exit immersive mode"
            >
              <XIcon />
              <span>Exit</span>
            </button>
            <ProgressLabel progress={progress} />
          </div>

          {/* Bottom bar */}
          <div
            className="pointer-events-auto mt-auto flex-none px-5 pb-5 sm:px-8"
            style={{
              background:
                'linear-gradient(to top, var(--color-canvas-overlay) 0%, transparent 100%)'
            }}
          >
            {image.caption && (
              <p className="mb-3 text-sm leading-relaxed text-ink">{image.caption}</p>
            )}
            {/* Stop propagation so clicking nav buttons doesn't toggle overlay */}
            <div onClick={(e) => e.stopPropagation()}>
              <NavRow onPrev={onPrev} onNext={onNext} progress={progress} />
            </div>
          </div>
        </div>
      </button>
    ) : (
      // ── Gallery mode (Frame + Placard) ─────────────────────────────────
      <>
        {/* Top bar */}
        <div className="flex flex-none items-center justify-between px-5 pt-5 sm:px-8">
          <p className="truncate text-xs text-ink-faint">{galleryTitle}</p>
          <button
            type="button"
            onClick={onEnterFrameless}
            className="ml-4 flex-none rounded-card border border-border px-2.5 py-1 text-[11px] font-medium text-ink-faint transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            aria-label="Enter immersive mode"
          >
            Immersive
          </button>
        </div>

        {/* Photo */}
        <div className="flex flex-1 items-center justify-center overflow-hidden px-5 py-4 sm:px-8">
          <Frame className="w-full max-w-2xl">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-sm bg-sun">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                loading={loadEager ? 'eager' : 'lazy'}
                sizes="(min-width: 768px) 768px, 100vw"
              />
            </div>
          </Frame>
        </div>

        {/* Bottom bar */}
        <div className="flex-none px-5 pb-5 sm:px-8">
          {image.caption && <Placard title={image.caption} size="sm" className="mb-3" />}
          <NavRow onPrev={onPrev} onNext={onNext} progress={progress} />
        </div>
      </>
    )}
  </div>
);

// ── ClosingPanel ─────────────────────────────────────────────────────────────

type ClosingPanelProps = {
  panelRef: PanelRefSetter;
  gallery: GalleryDetail;
  progress: Progress;
  onBack: () => void;
};

const ClosingPanel = ({ panelRef, gallery, progress, onBack }: ClosingPanelProps) => (
  <div
    ref={panelRef}
    className="relative flex h-[100svh] snap-start flex-col"
    aria-label="Exhibit conclusion"
  >
    {/* Top bar */}
    <div className="flex flex-none items-center px-5 pt-5 sm:px-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-ink-faint transition-colors duration-fast hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
      >
        ← Back
      </button>
    </div>

    {/* Content */}
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center sm:px-10">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
        Exhibit complete
      </p>
      <p className="mb-10 max-w-sm text-lg leading-relaxed text-ink-muted">
        {gallery.title} — every session documented here is a privilege. If something resonated,
        reach out.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/inquire"
          className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Inquire
        </Link>
        <Link
          href="/portfolio"
          className="rounded-card border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          View all galleries
        </Link>
      </div>
    </div>

    {/* Bottom chrome */}
    <div className="flex flex-none items-center px-5 pb-5 sm:px-8">
      <ProgressLabel progress={progress} />
    </div>
  </div>
);

// ── Shared primitives ─────────────────────────────────────────────────────────

type NavRowProps = {
  onPrev: () => void;
  onNext: () => void;
  progress: Progress;
};

const NavRow = ({ onPrev, onNext, progress }: NavRowProps) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={onPrev}
      aria-label="Previous panel"
      className="flex h-9 w-9 items-center justify-center rounded-card border border-border text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <ChevronUpIcon />
    </button>
    <ProgressLabel progress={progress} />
    <button
      type="button"
      onClick={onNext}
      aria-label="Next panel"
      className="flex h-9 w-9 items-center justify-center rounded-card border border-border text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <ChevronDownIcon />
    </button>
  </div>
);

const ProgressLabel = ({ progress }: { progress: Progress }) => (
  <span className="tabular-nums text-xs text-ink-faint">
    {progress.current} / {progress.total}
  </span>
);

// ── Icons ─────────────────────────────────────────────────────────────────────

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4 10l4-4 4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
