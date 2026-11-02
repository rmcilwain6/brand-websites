import { Newsreader } from 'next/font/google';
import type { ReactNode } from 'react';

// Loaded here rather than in the root layout, so the rest of the site doesn't download it.
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap'
});

const PassionProjectsLayout = ({ children }: { children: ReactNode }) => (
  <div className={newsreader.variable}>{children}</div>
);

export default PassionProjectsLayout;
