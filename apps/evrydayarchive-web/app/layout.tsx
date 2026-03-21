import './globals.css';
import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';

import { ThemeProvider } from './providers/theme-provider';
import { SiteHeader } from './components/site-header';
import { SiteFooter } from './components/site-footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap'
});

export const metadata = {
  title: 'Evryday Archive Co',
  description: 'A photography studio committed to documenting the moments that matter.'
};

const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === 'true';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    /*
     * suppressHydrationWarning prevents React from warning about the `class`
     * attribute mismatch that occurs when the inline FOUC-prevention script
     * adds `.dark` before hydration.
     */
    <html lang="en" suppressHydrationWarning className={plusJakartaSans.variable}>
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
          {children}
          {!isComingSoon && <SiteFooter />}
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
