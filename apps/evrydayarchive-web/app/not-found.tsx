import Image from './components/img';
import Link from 'next/link';

const NotFound = () => {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-10 sm:flex-row sm:items-center sm:gap-14">
        {/* Left — icon mark with 404 label underneath, like a mounted photo + caption */}
        <div className="flex flex-none flex-col items-center sm:items-start">
          <Image
            src="/logo/icon.svg"
            alt="Evryday Archive Co"
            width={150}
            height={87}
            priority
            className="dark:hidden"
          />
          <Image
            src="/logo/icon-dark.svg"
            alt="Evryday Archive Co"
            width={150}
            height={87}
            priority
            className="hidden dark:block"
          />
          <div className="mt-3 w-full border-t border-border pt-3 text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">404</p>
          </div>
        </div>

        {/* Vertical divider — desktop only */}
        <div className="hidden h-16 w-px flex-none bg-border sm:block" />

        {/* Right — copy + CTA */}
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <p className="text-base leading-relaxed text-ink-muted">
            The page you&apos;re looking for wasn&apos;t found. It may have moved, been removed, or
            never been part of the archive.
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-placard bg-accent px-4 py-2 text-xs font-medium uppercase tracking-widest text-white transition-opacity duration-fast hover:opacity-80"
          >
            Back to the archive
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
