import Link from 'next/link';

import SendVoucherForm from '../../vouchers/components/SendVoucherForm';

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
}: Props) => (
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
      <Link
        href={`/vouchers/${voucherId}`}
        className="ml-auto text-sm text-indigo-600 hover:text-indigo-500"
      >
        View voucher →
      </Link>
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

    <SendVoucherForm
      voucherId={voucherId}
      status={status}
      expired={expired}
      suggestedEmail={suggestedEmail}
    />
    {(status === 'PENDING' || status === 'ACTIVE') && !expired && (
      <p className="mt-2 text-xs text-slate-500">
        Only have a phone number or Instagram handle?{' '}
        <Link
          href={`/vouchers/${voucherId}#send`}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Send it as an image →
        </Link>
      </p>
    )}
  </div>
);

export default ReferralVoucherCard;
