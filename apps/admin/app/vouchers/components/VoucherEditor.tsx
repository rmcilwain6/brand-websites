'use client';

import { VOUCHER_STATUSES } from '@repo/core/vouchers';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '../../components/Toaster';
import DiscountFields, {
  type DiscountDraft,
  discountPayload,
  toDiscountDraft
} from './DiscountFields';
import { endOfDayUtc } from './voucher-display';

type Props = {
  voucher: {
    id: string;
    status: string;
    holderName: string | null;
    holderContact: string | null;
    /** YYYY-MM-DD, or '' for no expiry. */
    expiresOn: string;
    notes: string | null;
    discountType: string;
    amountCents: number | null;
    percentOff: number | null;
    redeemedBookingId: string | null;
  };
  /** Bookings it could be redeemed on, newest first (excludes the one that earned it). */
  bookings: { id: string; label: string }[];
};

const statusHelp: Record<string, string> = {
  PENDING: 'Not sent to the holder yet.',
  ACTIVE: 'The holder has their code and can use it.',
  REDEEMED: 'Used. Prefer “Mark redeemed on a booking” below so it links to the booking.',
  VOID: 'Cancelled, invalid, or expired.'
};

const inputCls =
  'rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none';

const sectionTitle = 'mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400';

/** Status, details, and redemption controls for one voucher. */
const VoucherEditor = ({ voucher, bookings }: Props) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [busy, setBusy] = useState<'status' | 'details' | 'redeem' | null>(null);
  const [details, setDetails] = useState({
    holderName: voucher.holderName ?? '',
    holderContact: voucher.holderContact ?? '',
    expiresOn: voucher.expiresOn,
    notes: voucher.notes ?? ''
  });
  const [discount, setDiscount] = useState<DiscountDraft>(toDiscountDraft(voucher));
  const [bookingId, setBookingId] = useState('');

  const save = async (kind: NonNullable<typeof busy>, body: object, success: string) => {
    setBusy(kind);
    try {
      const res = await fetch(`/api/vouchers/${voucher.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error?.message ?? 'Failed to save.');
      }
      addToast(success, 'success');
      router.refresh();
      return true;
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save.', 'error');
      return false;
    } finally {
      setBusy(null);
    }
  };

  const saveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = discountPayload(discount);
    if (!parsed.ok) {
      addToast(parsed.error, 'error');
      return;
    }
    void save(
      'details',
      {
        ...parsed.value,
        holderName: details.holderName,
        holderContact: details.holderContact,
        expiresAt: details.expiresOn ? endOfDayUtc(details.expiresOn) : null,
        notes: details.notes
      },
      'Voucher saved.'
    );
  };

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;
    if (await save('redeem', { redeemedBookingId: bookingId }, 'Voucher marked redeemed.')) {
      setBookingId('');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className={sectionTitle}>Status</h2>
        <div className="flex flex-wrap gap-2">
          {VOUCHER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() =>
                s !== voucher.status && save('status', { status: s }, 'Status updated.')
              }
              disabled={busy !== null}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                voucher.status === s
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">{statusHelp[voucher.status]}</p>
      </section>

      <section>
        <h2 className={sectionTitle}>Redeem</h2>
        <form
          onSubmit={redeem}
          className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">
              {voucher.redeemedBookingId
                ? 'Move the redemption to another booking'
                : 'Mark redeemed on a booking'}
            </span>
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className={inputCls}
            >
              <option value="">Choose a booking…</option>
              {bookings
                .filter((b) => b.id !== voucher.redeemedBookingId)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={!bookingId || busy !== null}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {busy === 'redeem' ? 'Saving…' : 'Mark redeemed'}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-400">
          Works from any status. This only records that the code was used; it doesn&apos;t change
          the booking&apos;s total.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Details</h2>
        <form
          onSubmit={saveDetails}
          className="space-y-5 rounded-lg border border-slate-200 bg-white p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Holder name
              <input
                value={details.holderName}
                onChange={(e) => setDetails((d) => ({ ...d, holderName: e.target.value }))}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Holder contact
              <input
                value={details.holderContact}
                onChange={(e) => setDetails((d) => ({ ...d, holderContact: e.target.value }))}
                placeholder="Email, phone, or @handle"
                className={inputCls}
              />
            </label>
          </div>
          <p className="-mt-2 text-xs text-slate-400">
            Change the holder when a voucher is passed on to someone else.
          </p>

          <DiscountFields value={discount} onChange={setDiscount} />

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Good until
            <input
              type="date"
              value={details.expiresOn}
              onChange={(e) => setDetails((d) => ({ ...d, expiresOn: e.target.value }))}
              className={`${inputCls} w-48`}
            />
            <span className="text-xs font-normal text-slate-400">
              Clear the date for no expiry.
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Notes
            <textarea
              value={details.notes}
              onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
              rows={3}
              className={inputCls}
            />
          </label>

          <button
            type="submit"
            disabled={busy !== null}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {busy === 'details' ? 'Saving…' : 'Save details'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default VoucherEditor;
