import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { ThemeProvider } from './providers/theme-provider';
import { SiteHeader } from './components/site-header';
import { SiteFooter } from './components/site-footer';
import { NavigationFeedback } from './components/navigation-feedback';
import { PageFade } from './components/page-fade';

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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Evryday Archive Co',
  founder: {
    '@type': 'Person',
    name: 'Reed McIlwain'
  },
  description:
    'Kamloops & Vancouver Island photographer documenting ordinary life as something worth keeping. Accessible sessions, transparent pricing.',
  url: 'https://evrydayarchive.co',
  areaServed: [
    {
      '@type': 'City',
      name: 'Kamloops',
      containedInPlace: {
        '@type': 'State',
        name: 'British Columbia',
        containedInPlace: { '@type': 'Country', name: 'Canada' }
      }
    },
    {
      '@type': 'City',
      name: 'Vancouver',
      containedInPlace: {
        '@type': 'State',
        name: 'British Columbia',
        containedInPlace: { '@type': 'Country', name: 'Canada' }
      }
    },
    {
      '@type': 'City',
      name: 'Victoria',
      containedInPlace: {
        '@type': 'State',
        name: 'British Columbia',
        containedInPlace: { '@type': 'Country', name: 'Canada' }
      }
    },
    {
      '@type': 'City',
      name: 'Nanaimo',
      containedInPlace: {
        '@type': 'State',
        name: 'British Columbia',
        containedInPlace: { '@type': 'Country', name: 'Canada' }
      }
    }
  ],
  sameAs: ['https://www.instagram.com/evrydayarchive.co/']
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          {!isComingSoon && <SiteHeader />}
          <NavigationFeedback />
          {/* pb-16 on mobile reserves space for the fixed bottom nav bar */}
          <div className="pb-16 md:pb-0">
            <PageFade>{children}</PageFade>
          </div>
          {!isComingSoon && <SiteFooter />}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
