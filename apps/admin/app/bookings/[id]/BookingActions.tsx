'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '../../components/Toaster';

const ALL_STATUSES = ['PENDING', 'REVIEWED', 'APPROVED', 'DECLINED', 'CANCELLED'] as const;
type BookingStatus = (typeof ALL_STATUSES)[number];

type Props = {
  bookingId: string;
  currentStatus: string;
  emailSentAt: string | null;
};

const BookingActions = ({ bookingId, currentStatus, emailSentAt }: Props) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [status, setStatus] = useState<BookingStatus>(currentStatus as BookingStatus);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleStatusChange = async (next: BookingStatus) => {
    if (next === status || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setStatus(next);
      addToast('Status updated.', 'success');
    } catch {
      addToast('Failed to update status.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/resend`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'Failed to send emails');
      }
      addToast('Emails sent successfully.', 'success');
      router.refresh();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to send emails.', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/bookings');
    } catch {
      addToast('Failed to delete booking.', 'error');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Status */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Status
        </h2>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={saving}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                status === s
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Resend */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Emails
        </h2>
        <button
          onClick={handleResend}
          disabled={resending}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {resending ? 'Sending…' : emailSentAt ? 'Resend emails' : 'Send emails'}
        </button>
        <p className="mt-2 text-xs text-slate-400">
          Sends both the client confirmation and your notification email.
        </p>
      </section>

      {/* Danger zone */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Danger zone
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              confirmDelete
                ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            {deleting ? 'Deleting…' : confirmDelete ? 'Confirm delete' : 'Delete booking'}
          </button>
          {confirmDelete && !deleting && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Permanently removes the booking and its contact record.
        </p>
      </section>
    </div>
  );
};

export default BookingActions;
