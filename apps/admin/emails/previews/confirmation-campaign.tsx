// Preview only (`pnpm --filter admin email:preview`): the client's copy of a campaign application.
import * as React from 'react';

import { BookingConfirmation } from '../booking-confirmation';
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
    acknowledgedAt: '2026-11-02T03:00:00.000Z',
    ackVersion: 1
  }
};

const ConfirmationCampaign = () => <BookingConfirmation {...props} />;

export default ConfirmationCampaign;
