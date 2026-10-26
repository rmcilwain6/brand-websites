// Preview only (`pnpm --filter admin email:preview`): a booking with none of the optional extras.
import * as React from 'react';

import { BookingNotification } from '../booking-notification';
import type { BookingEmailData } from '../components/types';

const props: BookingEmailData = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  location: 'Kamloops',
  preferredDate: '2026-11-21',
  inquiryId: 'clz9plain0000',
  adminUrl: 'http://localhost:3001/bookings/clz9booking'
};

const NotificationPlain = () => <BookingNotification {...props} />;

export default NotificationPlain;
