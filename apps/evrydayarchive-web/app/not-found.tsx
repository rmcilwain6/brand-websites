import Image from 'next/image';
import Link from 'next/link';

const NotFound = () => {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      <Image
        src="/stacked - light.svg"
        alt="Evryday Archive Co"
        width={190}
        height={145}
        priority
        // dark:invert is a stopgap — replace once dark-mode SVG variants exist
        className="dark:invert"
      />

      <p className="mt-8 text-xs font-medium uppercase tracking-widest text-ink-faint">404</p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        This moment doesn&apos;t exist
      </h1>

      <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-muted">
        The page you&apos;re looking for wasn&apos;t found — it may have moved, been removed, or
        never been here at all.
      </p>

      <Link
        href="/"
        className="mt-10 text-sm font-medium text-ink underline underline-offset-4 transition-opacity duration-fast hover:opacity-60"
      >
        Back to the archive
      </Link>
    </main>
  );
};

export default NotFound;
