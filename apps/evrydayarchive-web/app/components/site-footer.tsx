import Image from 'next/image';
import Link from 'next/link';

import { FooterCredits } from './footer-credits';
import { FooterEmailCapture } from './footer-email-capture';

const NAV = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/packages', label: 'Packages' },
  { href: '/inquire', label: 'Inquire' }
];

export const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-stretch sm:gap-10">
          {/* Brand — mobile: order 1 | desktop: col 1 row 1 */}
          <div className="order-1 space-y-2 text-center sm:col-start-1 sm:row-start-1 sm:text-left">
            {/* Camera icon mark */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/icon.svg" alt="" className="mx-auto h-8 w-auto sm:mx-0" />
            <p className="text-sm font-semibold text-ink">Evryday Archive Co</p>
            <p className="text-xs text-ink-faint">Documenting life in Kamloops & BC</p>
          </div>

          {/* Email capture — mobile: order 2 | desktop: col 3 row 1 */}
          <div className="order-2 w-full max-w-[300px] sm:max-w-none sm:col-start-3 sm:row-start-1 sm:ml-auto sm:w-3/5">
            <FooterEmailCapture />
          </div>

          {/* Social — mobile: order 3 | desktop: col 1 row 2 */}
          <div className="order-3 space-y-2 text-center sm:col-start-1 sm:row-start-2 sm:text-left">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
              Find me on
            </p>
            <div className="flex items-center justify-center gap-4 sm:justify-start">
              <a
                href="https://www.instagram.com/evrydayarchive.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-50 transition-opacity duration-fast hover:opacity-100"
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
                className="opacity-50 transition-opacity duration-fast hover:opacity-100"
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

          {/* Nav — hidden on mobile | desktop: col 2 spanning both rows */}
          <nav
            aria-label="Footer navigation"
            className="hidden sm:flex sm:col-start-2 sm:row-start-1 sm:row-span-2 flex-col gap-2"
          >
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink-faint transition-colors duration-fast hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Back to entrance — mobile: order 4 | desktop: col 3 row 2 */}
          <Link
            href="/"
            className="order-4 flex items-center justify-center gap-2.5 text-sm text-ink-faint transition-colors duration-fast hover:text-ink sm:col-start-3 sm:row-start-2 sm:mt-auto sm:self-end sm:justify-end"
          >
            Back to the entrance
            {/* Entrance icon — Zach Bogart / Noun Project */}
            <svg
              width="30"
              height="30"
              viewBox="0 0 100 100"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
              aria-hidden
              className="shrink-0"
            >
              <path d="M24.966,86.803c0,0.369 -0.3,0.669 -0.669,0.669c-2.201,-0 -9.076,-0 -9.076,-0c-0.69,-0 -1.25,-0.56 -1.25,-1.25l0,-37.666c0,-19.898 16.13,-36.028 36.028,-36.028l0.002,0c19.898,0 36.028,16.13 36.028,36.028l0,37.673c0,0.691 -0.559,1.243 -1.25,1.243c0,-0 -42.296,-0.023 -48.149,-0.026c-0.37,0 -0.669,-0.299 -0.669,-0.669c0,-2.648 0,-12.257 0,-12.257c-0,-0.556 0.367,-1.042 0.894,-1.199l7.632,-2.266l0,-10.751c-0,-0.556 0.367,-1.042 0.894,-1.198l7.632,-2.267l0,-10.751c-0,-0.556 0.367,-1.042 0.894,-1.198l7.632,-2.267l0,-10.751c-0,-0.556 0.367,-1.042 0.894,-1.198l3.84,-1.141c-4.376,-3.747 -10.06,-6.01 -16.273,-6.01c-13.826,0 -25.034,11.208 -25.034,25.034c0,0 0,33.098 0,38.246Zm50.068,-30.281l0,-7.965c0,-0.409 -0.01,-0.815 -0.029,-1.219l-19.492,0l0,9.184l19.521,-0Zm0,14.215l0,-9.183l-28.047,0l0,9.183l28.047,0Zm0,14.216l0,-9.183l-36.573,-0l0,9.183l36.573,0Zm-0.787,-42.647c-0.872,-3.393 -2.437,-6.507 -4.536,-9.184l-5.672,0l0,9.184l10.208,-0Z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 flex items-center">
          <div className="flex-1 border-t border-border" />
          <div className="mx-3 flex items-center gap-1">
            <div className="h-1.5 w-1.5 flex-none rounded-full bg-accent/80" />
            <div className="h-1.5 w-1.5 flex-none rounded-full bg-accent/80" />
            <div className="h-1.5 w-1.5 flex-none rounded-full bg-accent/80" />
          </div>
          <div className="flex-1 border-t border-border" />
        </div>
        <div className="mt-6 pb-28 md:pb-10">
          {/* Mobile: two rows */}
          <div className="flex items-center justify-between md:hidden">
            <p className="text-xs text-ink-faint">© {year} Evryday Archive Co.</p>
            <FooterCredits />
          </div>
          <p className="mt-3 text-xs text-ink-faint md:hidden">Site by Reed McIlwain</p>
          {/* Desktop: single row, three columns */}
          <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
            <p className="text-xs text-ink-faint">© {year} Evryday Archive Co.</p>
            <p className="text-xs text-ink-faint">Site by Reed McIlwain</p>
            <div className="flex justify-end">
              <FooterCredits />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
