import Image from 'next/image';
import Link from 'next/link';

import { FooterCredits } from './footer-credits';
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
        <div className="flex flex-col gap-10 sm:flex-row sm:items-stretch sm:justify-between">
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
          </div>

          {/* Column 2: Nav */}
          <nav aria-label="Footer navigation" className="flex flex-col gap-2">
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

          {/* Column 3: Email capture + Back to entrance */}
          <div className="flex flex-col sm:min-w-[260px]">
            <FooterEmailCapture />
            <Link
              href="/"
              className="mt-auto self-end pt-8 flex items-center gap-2.5 text-sm text-ink-faint transition-colors duration-fast hover:text-ink"
            >
              Back to the entrance
              {/* Entrance icon — Zach Bogart / Noun Project */}
              <svg
                width="24"
                height="24"
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
        <div className="mt-6 pb-10 grid grid-cols-3 items-center">
          <p className="text-xs text-ink-faint">© {year} Evryday Archive Co. Kamloops, BC.</p>
          <p className="text-center text-xs text-ink-faint">Site by Reed McIlwain</p>
          <div className="flex justify-end">
            <FooterCredits />
          </div>
        </div>
      </div>
    </footer>
  );
};
