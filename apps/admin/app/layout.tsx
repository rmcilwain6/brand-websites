import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Evryday Admin',
  description: 'Admin operations for the archive.'
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
