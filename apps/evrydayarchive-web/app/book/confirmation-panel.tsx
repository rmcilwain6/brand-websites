import Link from 'next/link';

export const ConfirmationPanel = ({ name }: { name: string }) => {
  const firstName = name.split(' ')[0] ?? name;

  return (
    <div className="rounded-card border border-border bg-sun px-8 py-14 text-center">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
        Request sent
      </p>
      <h2 className="mb-4 text-2xl font-semibold text-ink">You&apos;re all set, {firstName}.</h2>
      <p className="mx-auto mb-10 max-w-sm text-base leading-relaxed text-ink-muted">
        I&apos;ve got your request. I&apos;ll be in touch to confirm the date and go over any
        details.
      </p>
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
