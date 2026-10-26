// Preview only (`pnpm --filter admin email:preview`): the client confirmation with no package,
// voucher, spot ideas or notes.
import * as React from 'react';

import { BookingConfirmation } from '../booking-confirmation';
import type { BookingEmailData } from '../components/types';

const props: BookingEmailData = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  location: 'Kamloops',
  preferredDate: '2026-11-21',
  inquiryId: 'clz9plain0000'
};

const ConfirmationPlain = () => <BookingConfirmation {...props} />;

export default ConfirmationPlain;
