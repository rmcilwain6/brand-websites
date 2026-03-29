'use client';

import { useEffect, useRef, useState } from 'react';

type PhotoCreditProps = {
  credit: string;
  href?: string;
};

export const PhotoCredit = ({ credit, href }: PhotoCreditProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Tooltip — appears above the icon */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded border border-border bg-canvas px-2 py-1.5 shadow-warm-sm">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[9px] text-ink-muted transition-colors duration-fast hover:text-accent"
            >
              {credit} ↗
            </a>
          ) : (
            <p className="font-mono text-[9px] text-ink-muted">{credit}</p>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Photo credit"
        aria-expanded={open}
        className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#b0a898]/70 bg-black/20 backdrop-blur-sm transition-colors duration-fast hover:border-[#b0a898]"
      >
        <span className="font-mono text-[8px] leading-none text-[#d4cfc6]">i</span>
      </button>
    </div>
  );
};
