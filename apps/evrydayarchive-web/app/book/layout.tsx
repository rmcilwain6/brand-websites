import { Newsreader } from 'next/font/google';
import type { ReactNode } from 'react';

// For the note an applicant sees once they've applied. Not preloaded, so only they download it.
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
  preload: false
});

const BookLayout = ({ children }: { children: ReactNode }) => (
  <div className={newsreader.variable}>{children}</div>
);

export default BookLayout;
