'use client';

import { REFERRAL } from '@repo/core/referrals';
import { voucherDiscountColumns } from '@repo/core/vouchers';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import DiscountFields, {
  type DiscountDraft,
  discountPayload,
  toDiscountDraft
} from './DiscountFields';
import { endOfDayUtc } from './voucher-display';

const inputCls =
  'rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none';

/** Manual voucher creation. Defaults to the current referral reward and expiry. */
const NewVoucherForm = () => {
  const router = useRouter();
  const [discount, setDiscount] = useState<DiscountDraft>(
    toDiscountDraft(voucherDiscountColumns(REFERRAL.discount))
  );
  const [form, setForm] = useState({
    holderName: '',
    holderContact: '',
    referrerName: '',
    referrerContact: '',
    expiresOn: REFERRAL.expiresOn,
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = discountPayload(discount);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsed.value,
          holderName: form.holderName || undefined,
          holderContact: form.holderContact || undefined,
          referrerName: form.referrerName || undefined,
          referrerContact: form.referrerContact || undefined,
          expiresAt: form.expiresOn ? endOfDayUtc(form.expiresOn) : null,
          notes: form.notes || undefined
        })
      });
      const payload = await response.json();
      if (!payload.ok) {
        setError(payload.error?.message ?? 'Unable to create voucher.');
        setSubmitting(false);
        return;
      }
      router.push(`/vouchers/${payload.data.id}`);
    } catch {
      setError('Unable to create voucher.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
        <DiscountFields value={discount} onChange={setDiscount} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Holder name
            <input
              value={form.holderName}
              onChange={set('holderName')}
              required
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Holder contact
            <input
              value={form.holderContact}
              onChange={set('holderContact')}
              placeholder="Email, phone, or @handle"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Referred someone? (optional)
            <input
              value={form.referrerName}
              onChange={set('referrerName')}
              placeholder="Referrer name"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Referrer contact (optional)
            <input
              value={form.referrerContact}
              onChange={set('referrerContact')}
              className={inputCls}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Good until
          <input
            type="date"
            value={form.expiresOn}
            onChange={set('expiresOn')}
            className={`${inputCls} w-48`}
          />
          <span className="text-xs font-normal text-slate-400">
            Clear the date for a voucher that never expires.
          </span>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Notes (optional)
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={3}
            placeholder="Why it was issued, who it's for…"
            className={inputCls}
          />
        </label>
      </section>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create voucher'}
        </button>
        <p className="text-xs text-slate-400">
          A code is generated for you. It starts Pending until you send or hand it out.
        </p>
      </div>
    </form>
  );
};

export default NewVoucherForm;
