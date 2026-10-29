'use client';

import type { VoucherDiscountType } from '@repo/core/vouchers';

export type DiscountDraft = {
  discountType: VoucherDiscountType;
  /** Dollars as typed, e.g. "15" or "12.50". */
  amount: string;
  /** Whole percent as typed. */
  percent: string;
};

export const toDiscountDraft = (v: {
  discountType: string;
  amountCents: number | null;
  percentOff: number | null;
}): DiscountDraft => ({
  discountType: v.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
  amount: v.amountCents != null ? String(v.amountCents / 100) : '',
  percent: v.percentOff != null ? String(v.percentOff) : ''
});

/**
 * The draft as API fields, or an error message. Matches VoucherDiscountSchema: a positive
 * whole number of cents, or a whole percent from 1 to 100.
 */
export const discountPayload = (
  d: DiscountDraft
):
  | { ok: true; value: { discountType: 'FIXED_AMOUNT'; amountCents: number } }
  | { ok: true; value: { discountType: 'PERCENTAGE'; percentOff: number } }
  | { ok: false; error: string } => {
  if (d.discountType === 'FIXED_AMOUNT') {
    const cents = Math.round(Number(d.amount) * 100);
    if (!d.amount.trim() || !Number.isFinite(cents) || cents <= 0) {
      return { ok: false, error: 'Enter an amount above $0.' };
    }
    return { ok: true, value: { discountType: 'FIXED_AMOUNT', amountCents: cents } };
  }
  const percent = Number(d.percent);
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
    return { ok: false, error: 'Enter a whole percentage from 1 to 100.' };
  }
  return { ok: true, value: { discountType: 'PERCENTAGE', percentOff: percent } };
};

const inputCls =
  'w-28 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none';

/** A fixed amount or a percentage off. */
const DiscountFields = ({
  value,
  onChange
}: {
  value: DiscountDraft;
  onChange: (next: DiscountDraft) => void;
}) => (
  <fieldset className="flex flex-col gap-2">
    <legend className="mb-2 text-sm font-medium text-slate-700">Discount</legend>
    <div className="flex flex-wrap gap-4 text-sm text-slate-700">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="discountType"
          checked={value.discountType === 'FIXED_AMOUNT'}
          onChange={() => onChange({ ...value, discountType: 'FIXED_AMOUNT' })}
        />
        Fixed amount
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="discountType"
          checked={value.discountType === 'PERCENTAGE'}
          onChange={() => onChange({ ...value, discountType: 'PERCENTAGE' })}
        />
        Percentage
      </label>
    </div>
    {value.discountType === 'FIXED_AMOUNT' ? (
      <label className="flex items-center gap-2 text-sm text-slate-600">
        $
        <input
          inputMode="decimal"
          value={value.amount}
          onChange={(e) => onChange({ ...value, amount: e.target.value })}
          placeholder="15"
          aria-label="Amount in dollars"
          className={inputCls}
        />
        off
      </label>
    ) : (
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          inputMode="numeric"
          value={value.percent}
          onChange={(e) => onChange({ ...value, percent: e.target.value })}
          placeholder="10"
          aria-label="Percent off"
          className={inputCls}
        />
        % off
      </label>
    )}
  </fieldset>
);

export default DiscountFields;
