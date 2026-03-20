import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminShell } from '../components/AdminShell';
import { getSessionCookieName, verifyAdminSessionToken } from '../lib/auth';

const ReviewsLayout = ({ children }: { children: ReactNode }) => {
  const token = cookies().get(getSessionCookieName())?.value;

  if (!verifyAdminSessionToken(token)) {
    redirect('/login');
  }

  return <AdminShell>{children}</AdminShell>;
};

export default ReviewsLayout;
