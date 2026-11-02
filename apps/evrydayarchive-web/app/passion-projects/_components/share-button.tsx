'use client';

import { useState } from 'react';

/** Shares the page through the device's share sheet, or copies the link where there isn't one. */
export const ShareButton = ({ title }: { title: string }) => {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    // The page itself, without whatever this visitor has answered further down.
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
