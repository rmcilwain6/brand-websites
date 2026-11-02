'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '../../lib/cn';
import { scrollToSection } from './scroll-link';

const PAGE_PATH = '/passion-projects';

/** The campaign page, without any answers, from whichever page the button is on. */
const pageUrl = () => `${window.location.origin}${PAGE_PATH}`;

/** Copies the campaign page's link, with `copied` true for a couple of seconds after. Rejects on failure. */
const useCopyLink = () => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    await navigator.clipboard.writeText(pageUrl());
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return { copied, copy };
};

const labelCls =
  'transition-[opacity,transform] duration-[180ms] ease-out [grid-area:1/1] motion-reduce:transition-none';

/**
 * Copies the campaign page's link, and the label slides over to say so. The clipboard isn't
 * available everywhere, so it goes to the campaign page's `fallbackTo` section, which has its own
 * way to share.
 */
export const CopyLinkButton = ({
  label,
  fallbackTo,
  variant = 'outline',
  className
}: {
  label: string;
  fallbackTo: string;
  variant?: 'outline' | 'solid';
  className?: string;
}) => {
  const { copied, copy } = useCopyLink();

  const showFallback = () => {
    if (document.getElementById(fallbackTo)) scrollToSection(fallbackTo);
    else window.location.assign(`${PAGE_PATH}#${fallbackTo}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => copy().catch(showFallback)}
        className={cn(
          className,
          variant === 'solid'
            ? 'bg-accent text-white'
            : copied
              ? 'border-accent-text text-accent-text'
              : 'border-border text-ink hover:border-ink-muted'
        )}
      >
        {/* Both labels share one grid cell, so the button keeps its width as they swap. */}
        <span className="grid justify-items-center overflow-hidden">
          <span
            aria-hidden={copied}
            className={cn(labelCls, copied && '-translate-y-full opacity-0')}
          >
            {label}
          </span>
          <span
            aria-hidden={!copied}
            className={cn(
              labelCls,
              'flex items-center gap-1.5',
              !copied && 'translate-y-full opacity-0'
            )}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M3 8.5 6.5 12 13 4.5" />
            </svg>
            Link copied
          </span>
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Link copied' : ''}
      </span>
    </>
  );
};

/** Shares the page through the device's share sheet, or copies the link where there isn't one. */
export const ShareButton = ({ title }: { title: string }) => {
  const { copied, copy } = useCopyLink();

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: pageUrl() });
        return;
      }
      await copy();
    } catch {
      // Closing the share sheet lands here too, and there's nothing to do about either.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="flex h-[50px] items-center justify-center rounded-card bg-[#1b1a19] px-[22px] text-[15px] font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b1a19] lg:h-12 lg:self-start"
    >
      <span aria-live="polite">{copied ? 'Link copied' : 'Share this page'}</span>
    </button>
  );
};
