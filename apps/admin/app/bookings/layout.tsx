import type { ReactNode } from 'react';

import { AdminShell } from '../components/AdminShell';

const BookingsLayout = ({ children }: { children: ReactNode }) => (
  <AdminShell>{children}</AdminShell>
);

export default BookingsLayout;
