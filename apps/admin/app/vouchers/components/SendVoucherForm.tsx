'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '../../components/Toaster';

type Props = {
  voucherId: string;
  status: string;
  expired: boolean;
  /** An email address to prefill, e.g. the holder's or referrer's contact if it's an email. */
  suggestedEmail: string;
};

/** Emails the referral thank-you with the voucher code. Used on the booking and voucher pages. */
const SendVoucherForm = ({ voucherId, status, expired, suggestedEmail }: Props) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [to, setTo] = useState(suggestedEmail);
  const [sending, setSending] = useState(false);

  const blocked =
    status === 'REDEEMED'
      ? 'This voucher has already been used.'
      : status === 'VOID'
        ? 'This voucher has been voided.'
        : expired
          ? 'This voucher has expired.'
          : null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`/api/vouchers/${voucherId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'Failed to send the voucher.');
      }
      addToast(`Voucher sent to ${to.trim()}.`, 'success');
      router.refresh();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to send the voucher.', 'error');
    } finally {
      setSending(false);
    }
  };

  if (blocked) return <p className="mt-3 text-sm text-slate-500">{blocked}</p>;

  return (
    <>
      <form onSubmit={handleSend} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Send the thank-you email to</span>
          <input
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="their@email.com"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={sending || !to.trim()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {sending ? 'Sending…' : status === 'ACTIVE' ? 'Resend code' : 'Send thank-you'}
        </button>
      </form>
      {status === 'PENDING' && (
        <p className="mt-2 text-xs text-slate-400">
          Sends a thank-you with the code, how to use it, and how to pass it on. Sending marks the
          voucher Active.
        </p>
      )}
    </>
  );
};

export default SendVoucherForm;
