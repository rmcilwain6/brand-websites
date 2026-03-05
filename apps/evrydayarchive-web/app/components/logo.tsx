import Link from 'next/link';

type LogoProps = {
  /** 'wordmark' shows the full brand name; 'mark' shows the compact EA monogram */
  variant?: 'wordmark' | 'mark';
};

export const Logo = ({ variant = 'wordmark' }: LogoProps) => {
  if (variant === 'mark') {
    return (
      <Link
        href="/"
        aria-label="Evryday Archive Co — home"
        className="inline-flex items-center font-semibold tracking-tight text-ink transition-opacity duration-fast hover:opacity-70"
      >
        <span className="text-sm">EA</span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label="Evryday Archive Co — home"
      className="inline-flex items-baseline gap-1.5 transition-opacity duration-fast hover:opacity-70"
    >
      <span className="text-sm font-semibold tracking-tight text-ink">Evryday Archive</span>
      <span className="text-xs font-medium text-ink-faint">Co</span>
    </Link>
  );
};
