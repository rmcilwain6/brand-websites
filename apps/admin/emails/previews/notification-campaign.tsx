// Preview only (`pnpm --filter admin email:preview`): a booking that's also a campaign application.
import * as React from 'react';

import { BookingNotification } from '../booking-notification';
import type { BookingEmailData } from '../components/types';

const props: BookingEmailData = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  location: 'Kamloops',
  preferredDate: '2026-11-21',
  packageName: 'In Practice',
  inquiryId: 'clz9campaign0000',
  campaign: {
    label: 'Passion Projects Winter 2026',
    whatWorkingOn: 'A sewing business',
    aboutIt: 'Three years in. Most days start at the cutting table before the kids are up.',
    link: '@jordan.sews',
    othersInvolved: 'My sister helps on market days',
    acknowledgedAt: '2026-11-02T03:00:00.000Z',
    ackVersion: 1
  },
  adminUrl: 'http://localhost:3001/bookings/clz9booking'
};

const NotificationCampaign = () => <BookingNotification {...props} />;

export default NotificationCampaign;
