import { formatVoucherDiscount, toVoucherDiscount } from '@repo/core/vouchers';

/** Shared display helpers for vouchers in the admin. Server-safe (no hooks), and client-safe: imports the core subpath, not the Zod-heavy root. */

export const voucherStatusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REDEEMED: 'bg-slate-50 text-slate-500 border-slate-200',
  VOID: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-red-50 text-red-700 border-red-200'
};

/** Past its expiry and still usable on paper. Computed: there's no cron, Reed voids by hand. */
export const isVoucherExpired = (
  v: { status: string; expiresAt: Date | null },
  now = new Date()
): boolean =>
  (v.status === 'PENDING' || v.status === 'ACTIVE') && !!v.expiresAt && v.expiresAt < now;

export const VoucherStatusBadge = ({
  status,
  expiresAt
}: {
  status: string;
  expiresAt: Date | null;
}) => {
  const shown = isVoucherExpired({ status, expiresAt }) ? 'EXPIRED' : status;
  return (
    <span
      title={shown === 'EXPIRED' ? `${status}, but past its expiry date` : undefined}
      className={`shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${voucherStatusStyles[shown] ?? ''}`}
    >
      {shown}
    </span>
  );
};

/** "$15 off", "20% off", or "—" if the row's discount columns are inconsistent. */
export const voucherDiscountLabel = (v: {
  discountType: string;
  amountCents: number | null;
  percentOff: number | null;
}): string => {
  const discount = toVoucherDiscount(v);
  return discount ? `${formatVoucherDiscount(discount)} off` : '—';
};

/** "Dec 31, 2027". Expiry is stored as end of day UTC, so format in UTC. */
export const fmtVoucherDay = (d: Date) =>
  d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });

/** A date input's YYYY-MM-DD as the end of that day, UTC: how voucher expiry is stored. */
export const endOfDayUtc = (ymd: string) => `${ymd}T23:59:59.999Z`;
