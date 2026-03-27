import Image from 'next/image';
import Link from 'next/link';

const NAV = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/packages', label: 'Packages' },
  { href: '/process', label: 'Process' },
  { href: '/inquire', label: 'Inquire' },
  { href: '/contact', label: 'Contact' }
];

export const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand block */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink">Evryday Archive Co</p>
            <p className="text-xs text-ink-faint">Ottawa–Gatineau · Canada</p>
          </div>

          {/* Nav block */}
          <nav aria-label="Footer navigation" className="flex flex-col gap-2">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink-muted transition-colors duration-fast hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social block */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">Follow</p>
            <a
              href="https://www.instagram.com/evrydayarchive.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-ink-muted transition-colors duration-fast hover:text-ink"
            >
              <Image
                src="/logo/Instagram_Glyph_Black.svg"
                alt=""
                width={16}
                height={16}
                className="dark:hidden"
              />
              <Image
                src="/logo/Instagram_Glyph_White.svg"
                alt=""
                width={16}
                height={16}
                className="hidden dark:block"
              />
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/in/reedmcilwain/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-ink-muted transition-colors duration-fast hover:text-ink"
            >
              <Image
                src="/logo/InBug-Black.png"
                alt=""
                width={16}
                height={16}
                className="dark:hidden"
              />
              <Image
                src="/logo/InBug-White.png"
                alt=""
                width={16}
                height={16}
                className="hidden dark:block"
              />
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex items-center justify-between">
          <p className="text-xs text-ink-faint">
            © {year} Evryday Archive Co. All rights reserved.
          </p>
          <p className="text-xs text-ink-faint">Site by Reed McIlwain</p>
        </div>
      </div>
    </footer>
  );
};
