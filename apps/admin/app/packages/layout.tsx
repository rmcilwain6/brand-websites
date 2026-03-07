import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getSessionCookieName, verifyAdminSessionToken } from '../lib/auth';

const PackagesLayout = ({ children }: { children: ReactNode }) => {
  const token = cookies().get(getSessionCookieName())?.value;

  if (!verifyAdminSessionToken(token)) {
    redirect('/login');
  }

  return <>{children}</>;
};

export default PackagesLayout;
