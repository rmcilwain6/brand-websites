import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { ThemeProvider } from './providers/theme-provider';
import { SiteHeader } from './components/site-header';
import { SiteFooter } from './components/site-footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap'
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://evrydayarchive.co'),
  title: 'Evryday Archive Co | Reed McIlwain, Photographer',
  description:
    'Kamloops & Vancouver Island photographer documenting ordinary life as something worth keeping. Accessible sessions, transparent pricing.',
  openGraph: {
    type: 'website',
    url: 'https://evrydayarchive.co',
    title: 'Evryday Archive Co | Reed McIlwain, Photographer',
    description:
      'Kamloops & Vancouver Island photographer documenting ordinary life as something worth keeping. Accessible sessions, transparent pricing.',
    locale: 'en_CA',
    siteName: 'Evryday Archive Co'
  },
  twitter: {
    card: 'summary',
    title: 'Evryday Archive Co | Reed McIlwain, Photographer',
    description:
      'Kamloops & Vancouver Island photographer documenting ordinary life as something worth keeping. Accessible sessions, transparent pricing.'
  }
};

const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === 'true';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    /*
     * suppressHydrationWarning prevents React from warning about the `class`
     * attribute mismatch that occurs when the inline FOUC-prevention script
     * adds `.dark` before hydration.
     */
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        {/*
         * Inline script runs synchronously before first paint.
         * Reads the saved theme from localStorage and applies `.dark` to <html>
         * immediately — preventing a flash of the wrong theme on load.
         * Also applies `.no-transition` so the initial class change is instant.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ea-theme');document.documentElement.classList.add('no-transition');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {!isComingSoon && <SiteHeader />}
          {/* pb-16 on mobile reserves space for the fixed bottom nav bar */}
          <div className="pb-16 md:pb-0">{children}</div>
          {!isComingSoon && <SiteFooter />}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
