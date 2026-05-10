import { render } from '@react-email/render';
import { Resend } from 'resend';

import { BookingConfirmation } from '../../emails/booking-confirmation';
import { BookingNotification } from '../../emails/booking-notification';
import { getEmailEnv } from './env';

const FROM = 'Reed from Evryday Archive Co <reed@evrydayarchive.co>';

let resend: Resend | null = null;

const getResend = () => {
  if (!resend) {
    resend = new Resend(getEmailEnv().RESEND_API_KEY);
  }
  return resend;
};

export type ModifierLineItem = {
  name: string;
  displayValue?: string;
  priceDeltaCents: number | null;
};

type BookingEmailData = {
  name: string;
  email: string;
  phone?: string;
  location: string;
  preferredDate: string;
  preferredTime?: string;
  packageName?: string;
  estimatedTotalCents?: number;
  notes?: string;
  inquiryId: string;
  modifierLineItems?: ModifierLineItem[];
};

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
    subject: `Booking request received, ${data.name} \u2014 I'll be in touch soon`,
    html
  });
};
