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
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1fr_auto_minmax(130px,auto)]">
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
          <div className="flex flex-col">
            <FooterEmailCapture />
            <Link
              href="/"
              className="mt-auto self-end pt-8 flex items-center gap-2.5 text-sm text-ink-faint transition-colors duration-fast hover:text-ink"
            >
              Back to the entrance
              {/* Open door icon */}
              <svg
                width="18"
                height="20"
                viewBox="0 0 18 20"
                fill="none"
                aria-hidden
                className="shrink-0"
              >
                {/* Frame: top + right side */}
                <path
                  d="M1 20V1H17V20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Floor */}
                <line
                  x1="0"
                  y1="20"
                  x2="18"
                  y2="20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Open door panel — left-hinged, foreshortened */}
                <path
                  d="M1 1L7 2.5L7 20H1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Knob */}
                <circle cx="5.5" cy="11" r="1" fill="currentColor" />
              </svg>
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
