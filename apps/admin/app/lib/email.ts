import { render } from '@react-email/render';
import { Resend } from 'resend';

import { BookingConfirmation } from '../../emails/booking-confirmation';
import { BookingNotification } from '../../emails/booking-notification';
import { formatDateShort } from '../../emails/components/format';
import type { BookingEmailData } from '../../emails/components/types';
import { getEmailEnv } from './env';

const FROM = 'Reed from Evryday Archive Co <reed@evrydayarchive.co>';

let resend: Resend | null = null;

const getResend = () => {
  if (!resend) {
    resend = new Resend(getEmailEnv().RESEND_API_KEY);
  }
  return resend;
};

/**
 * "New booking: Sarah Holloway · Evryday · Sat, Nov 14 · Referral · Voucher", so the inbox
 * shows who, what, when, and whether there's referral work to do, without opening it.
 */
export const bookingNotificationSubject = (data: BookingEmailData) =>
  [
    `New booking: ${data.name}`,
    data.packageName,
    formatDateShort(data.preferredDate),
    data.referrer && 'Referral',
    data.voucherEntered && 'Voucher'
  ]
    .filter(Boolean)
    .join(' · ');

// ── Booking: confirmation to the client ──────────────────────────────────────

export const sendBookingConfirmation = async (data: BookingEmailData) => {
  const html = await render(BookingConfirmation(data));

  await getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: "Booking request received \u2014 I'll be in touch soon",
    html
  });
};

// ── Booking: notification to Reed ────────────────────────────────────────────

export const sendBookingNotification = async (data: BookingEmailData) => {
  const { NOTIFICATION_EMAIL } = getEmailEnv();
  const html = await render(BookingNotification(data));

  await getResend().emails.send({
    from: FROM,
    to: NOTIFICATION_EMAIL,
    replyTo: data.email,
    subject: bookingNotificationSubject(data),
    html
  });
};
