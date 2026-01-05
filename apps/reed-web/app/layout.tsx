import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Reed',
  description: 'A minimal Reed site placeholder.',
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
