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
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1fr_auto_minmax(260px,1fr)]">
          {/* Column 1: Brand + Social */}
          <div className="space-y-5">
            <div className="space-y-2">
              {/* Camera icon mark */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/icon.svg" alt="" className="h-8 w-auto" />
              <p className="text-sm font-semibold text-ink">Evryday Archive Co</p>
              <p className="text-xs text-ink-faint">Documenting life in Kamloops & BC</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
                Find me on
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/evrydayarchive.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity duration-fast hover:opacity-70"
                >
                  <Image
                    src="/logo/Instagram_Glyph_Black.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="dark:hidden"
                  />
                  <Image
                    src="/logo/Instagram_Glyph_White.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="hidden dark:block"
                  />
                  <span className="sr-only">Instagram</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/reedmcilwain/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity duration-fast hover:opacity-70"
                >
                  <Image
                    src="/logo/InBug-Black.png"
                    alt=""
                    width={20}
                    height={20}
                    className="dark:hidden"
                  />
                  <Image
                    src="/logo/InBug-White.png"
                    alt=""
                    width={20}
                    height={20}
                    className="hidden dark:block"
                  />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </div>
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
              className="flex items-center gap-2.5 text-sm text-ink-faint transition-colors duration-fast hover:text-ink"
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
      </div>

      {/* Copyright bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 flex items-center">
          <div className="flex-1 border-t border-border" />
          <div className="mx-3 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
          <div className="flex-1 border-t border-border" />
        </div>
        <div className="mt-6 pb-10 flex items-center justify-between">
          <p className="text-xs text-ink-faint">© {year} Evryday Archive Co. Kamloops, BC.</p>
          <p className="text-xs text-ink-faint">Site by Reed McIlwain</p>
        </div>
      </div>
    </footer>
  );
};
