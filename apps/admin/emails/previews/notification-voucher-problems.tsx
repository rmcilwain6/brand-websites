// Preview only (`pnpm --filter admin email:preview`): a possible self-referral, with a code
// that matches no voucher. Change `verdict` to see the other states.
import * as React from 'react';

import { BookingNotification } from '../booking-notification';
import type { BookingEmailData } from '../components/types';

const props: BookingEmailData = {
  name: 'Alex Rivera',
  email: 'alex@example.com',
  phone: '250-555-0144',
  location: 'Somewhere near Tofino',
  preferredDate: '2026-12-05',
  preferredTime: '15:30',
  packageName: 'Evryday',
  estimatedTotalCents: 15000,
  inquiryId: 'clz9problem000',
  heardFrom: 'Instagram',
  referrer: { name: 'Alex Rivera', sameAsBooker: true },
  referralVoucher: { code: 'EAC-M4PX', discountLabel: '$15', expiresOn: '2027-12-31' },
  voucherEntered: { entered: 'EAC-ZZZ9', check: { verdict: 'unknown', code: 'EAC-ZZZ9' } },
  adminUrl: 'http://localhost:3001/bookings/clz9booking'
};

const NotificationVoucherProblems = () => <BookingNotification {...props} />;

export default NotificationVoucherProblems;
