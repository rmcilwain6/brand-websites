'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { BadgeTone } from '../../../emails/components/ui';
import { useToast } from '../../components/Toaster';

type Props = {
  bookingId: string;
  /** The code exactly as the booker typed it. */
  entered: string;
  tone: BadgeTone;
  badge: string;
  summary: string;
  /** "Held by Sam · $15 off · expires Dec 31, 2027", when the code matched a voucher. */
  details: string | null;
  /** The matched voucher, if any. */
  voucherId: string | null;
  /** The matched voucher is ACTIVE and in date. */
  canRedeem: boolean;
};

const toneStyles: Record<BadgeTone, string> = {
  good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  bad: 'bg-red-50 text-red-700 border-red-200',
  muted: 'bg-slate-50 text-slate-500 border-slate-200'
};

/** The voucher code the booker entered, what it matched, and a button to redeem it here. */
const EnteredVoucherCard = ({
  bookingId,
  entered,
  tone,
  badge,
  summary,
  details,
  voucherId,
  canRedeem
}: Props) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = async () => {
    if (!voucherId) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setRedeeming(true);
    try {
      const res = await fetch(`/api/vouchers/${voucherId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'Failed to redeem the voucher.');
      }
      addToast('Voucher marked redeemed.', 'success');
      router.refresh();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to redeem the voucher.', 'error');
    } finally {
      setRedeeming(false);
      setConfirming(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-base font-semibold tracking-wider text-slate-900">
          {entered}
        </span>
        <span className={`rounded border px-2 py-0.5 text-xs font-medium ${toneStyles[tone]}`}>
          {badge}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{summary}</p>
      {details && <p className="mt-1 text-sm text-slate-600">{details}</p>}

      {canRedeem && (
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                confirming
                  ? 'border border-indigo-600 bg-white text-indigo-700 hover:bg-indigo-50'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {redeeming
                ? 'Redeeming…'
                : confirming
                  ? 'Confirm: mark redeemed'
                  : 'Mark redeemed on this booking'}
            </button>
            {confirming && !redeeming && (
              <button
                onClick={() => setConfirming(false)}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Take the discount off when you confirm the price with them. This only records that the
            code was used; it doesn&apos;t change the booking total.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnteredVoucherCard;
