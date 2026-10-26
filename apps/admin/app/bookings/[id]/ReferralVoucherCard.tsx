'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '../../components/Toaster';

type Props = {
  voucherId: string;
  code: string;
  status: string;
  /** "$15 off" */
  discountLabel: string | null;
  /** "Dec 31, 2027", or null for no expiry. */
  expiresLabel: string | null;
  expired: boolean;
  holderName: string | null;
  /** An email address to suggest, if the referrer gave one. */
  suggestedEmail: string;
  /** When the code was first sent (the voucher went ACTIVE), formatted. */
  sentLabel: string | null;
};

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REDEEMED: 'bg-slate-50 text-slate-500 border-slate-200',
  VOID: 'bg-red-50 text-red-700 border-red-200'
};

/** The referral voucher this booking created, and a form to email it to the referrer. */
const ReferralVoucherCard = ({
  voucherId,
  code,
  status,
  discountLabel,
  expiresLabel,
  expired,
  holderName,
  suggestedEmail,
  sentLabel
}: Props) => {
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

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-base font-semibold tracking-wider text-slate-900">
          {code}
        </span>
        <span
          className={`rounded border px-2 py-0.5 text-xs font-medium ${statusStyles[status] ?? ''}`}
        >
          {expired && status !== 'REDEEMED' && status !== 'VOID' ? 'EXPIRED' : status}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {[
          discountLabel,
          expiresLabel && `good until ${expiresLabel}`,
          holderName && `for ${holderName}`
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {sentLabel && <p className="mt-1 text-xs text-slate-500">First sent {sentLabel}.</p>}

      {blocked ? (
        <p className="mt-3 text-sm text-slate-500">{blocked}</p>
      ) : (
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
      )}
      {!blocked && status === 'PENDING' && (
        <p className="mt-2 text-xs text-slate-400">
          Sends a thank-you with the code, how to use it, and how to pass it on. Sending marks the
          voucher Active.
        </p>
      )}
    </div>
  );
};

export default ReferralVoucherCard;
