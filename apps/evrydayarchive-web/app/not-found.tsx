import Image from 'next/image';
import Link from 'next/link';

const NotFound = () => {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 sm:flex-row sm:items-center sm:gap-14">
        {/* Left — icon mark with 404 label underneath, like a mounted photo + caption */}
        <div className="flex-none">
          <Image
            src="/logo/icon.svg"
            alt="Evryday Archive Co"
            width={130}
            height={75}
            priority
            className="dark:hidden"
          />
          <Image
            src="/logo/icon-dark.svg"
            alt="Evryday Archive Co"
            width={130}
            height={75}
            priority
            className="hidden dark:block"
          />
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">404</p>
          </div>
        </div>

        {/* Vertical divider — desktop only */}
        <div className="hidden h-16 w-px flex-none bg-border sm:block" />

        {/* Right — quiet copy */}
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-ink-muted">
            The page you&apos;re looking for wasn&apos;t found. It may have moved, been removed, or
            never been part of the archive.
          </p>
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-widest text-ink-faint transition-opacity duration-fast hover:opacity-60"
          >
            Back to the archive
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
