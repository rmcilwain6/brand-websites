'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

type Props = {
  name: string;
  /** The booker entered a voucher code. No amount is shown: values vary and are checked by hand. */
  voucherEntered?: boolean;
};

export const ConfirmationPanel = ({ name, voucherEntered = false }: Props) => {
  const firstName = name.split(' ')[0] ?? name;
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The panel replaces the much taller form, which leaves the viewport near the bottom of the
  // page (on mobile, below the panel). Bring the whole panel into view and move focus to its
  // heading so screen readers announce the confirmation.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    panelRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, []);

  return (
    <div
      ref={panelRef}
      className="scroll-mt-6 rounded-card border border-border bg-sun px-8 py-14 text-center md:scroll-mt-24"
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
        Request sent
      </p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mb-4 text-2xl font-semibold text-ink focus:outline-none"
      >
        You&apos;re all set, {firstName}.
      </h2>
      <p className="mx-auto mb-10 max-w-sm text-base leading-relaxed text-ink-muted">
        I&apos;ve got your request. I&apos;ll be in touch to confirm the date and go over any
        details.
      </p>
      {voucherEntered && (
        <p className="mx-auto -mt-6 mb-10 max-w-sm text-sm leading-relaxed text-ink-muted">
          Your voucher code will be confirmed by email.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/portfolio"
          className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Explore the portfolio
        </Link>
        <Link
          href="/"
          className="rounded-card border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};
