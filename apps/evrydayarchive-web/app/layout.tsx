import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Evryday Archive',
  description: 'Daily artifacts and stories.'
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
