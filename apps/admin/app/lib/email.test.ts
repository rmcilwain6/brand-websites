import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mocks.send };
  }
}));
vi.mock('./env', () => ({
  getEmailEnv: () => ({ RESEND_API_KEY: 're_test', NOTIFICATION_EMAIL: 'notify@example.com' })
}));

import { sendBookingConfirmation, sendBookingNotification, sendReferralVoucher } from './email';

const data = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  location: 'Kamloops',
  preferredDate: '2026-11-21',
  inquiryId: 'inq_1'
};

describe('who gets each email', () => {
  beforeEach(() => {
    mocks.send.mockReset().mockResolvedValue({ data: { id: 'em_1' }, error: null });
  });

  it('sends the confirmation to the client, with a copy to Reed', async () => {
    await sendBookingConfirmation(data);

    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'jordan@example.com', bcc: 'reed@evrydayarchive.co' })
    );
  });

  it('sends the referral voucher to the referrer, with a copy to Reed', async () => {
    await sendReferralVoucher('sam@example.com', {
      holderName: 'Sam Patel',
      code: 'EAC-7KQ2',
      discountLabel: '$15',
      expiresOn: null
    });

    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'sam@example.com', bcc: 'reed@evrydayarchive.co' })
    );
  });

  it('sends the notification to Reed only, replying to the client', async () => {
    await sendBookingNotification(data);

    const sent = mocks.send.mock.calls[0]![0];
    expect(sent).toMatchObject({ to: 'notify@example.com', replyTo: 'jordan@example.com' });
    expect(sent.bcc).toBeUndefined();
  });
});
