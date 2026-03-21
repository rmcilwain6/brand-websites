import { Resend } from 'resend';

let resendClient: Resend | null = null;

const getClient = (): Resend | null => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
};

const getNotificationEmail = (): string | null => process.env.NOTIFICATION_EMAIL ?? null;

type BookingNotificationData = {
  inquiryId: string;
  name: string;
  email: string;
  phone?: string | null;
  packageName?: string | null;
  preferredDate: string;
  preferredTime?: string | null;
  notes?: string | null;
  modifierIds: string[];
  estimatedTotalCents?: number | null;
};

export const sendBookingNotification = async (data: BookingNotificationData): Promise<void> => {
  const client = getClient();
  const to = getNotificationEmail();

  if (!client || !to) {
    console.warn('[email] RESEND_API_KEY or NOTIFICATION_EMAIL not set — skipping notification');
    return;
  }

  const estimatedTotal =
    data.estimatedTotalCents != null
      ? `$${(data.estimatedTotalCents / 100).toFixed(2)}`
      : 'Not specified';

  const { error } = await client.emails.send({
    from: 'noreply@evrydayarchive.co',
    to,
    subject: `New booking request — ${data.packageName ?? 'No package'} — ${data.name}`,
    html: `
      <h2>New Booking Request</h2>
      <table cellpadding="6" cellspacing="0">
        <tr><td><strong>Name</strong></td><td>${data.name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${data.email}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${data.phone ?? 'Not provided'}</td></tr>
        <tr><td colspan="2"><hr /></td></tr>
        <tr><td><strong>Package</strong></td><td>${data.packageName ?? 'Not specified'}</td></tr>
        <tr><td><strong>Estimated Total</strong></td><td>${estimatedTotal}</td></tr>
        <tr><td><strong>Preferred Date</strong></td><td>${data.preferredDate}</td></tr>
        <tr><td><strong>Preferred Time</strong></td><td>${data.preferredTime ?? 'Not specified'}</td></tr>
        <tr><td><strong>Notes</strong></td><td>${data.notes ?? 'None'}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666;font-size:12px;">Inquiry ID: ${data.inquiryId}</p>
    `.trim()
  });

  if (error) {
    console.error('[email] Failed to send booking notification', error);
  }
};
