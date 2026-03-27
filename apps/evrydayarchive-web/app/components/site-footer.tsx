import Image from 'next/image';
import Link from 'next/link';

import { FooterEmailCapture } from './footer-email-capture';

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
          {/* Column 1: Brand + Social */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-ink">Evryday Archive Co</p>
              <p className="text-xs text-ink-faint">Documenting life in Kamloops & BC</p>
            </div>
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

          {/* Column 2: Nav */}
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

          {/* Column 3: Email capture + Back to entrance */}
          <div className="flex flex-col gap-8">
            <FooterEmailCapture />
            <Link
              href="/"
              className="group flex items-center gap-2.5 text-sm text-ink-faint transition-colors duration-fast hover:text-ink"
            >
              {/* Archway / entrance icon */}
              <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="none"
                aria-hidden
                className="shrink-0"
              >
                <path
                  d="M1 15V7.5A6 6 0 0 1 13 7.5V15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="0"
                  y1="15"
                  x2="14"
                  y2="15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Back to the entrance
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex items-center justify-between">
          <p className="text-xs text-ink-faint">© {year} Evryday Archive Co. Kamloops, BC.</p>
          <p className="text-xs text-ink-faint">Site by Reed McIlwain</p>
        </div>
      </div>
    </footer>
  );
};
