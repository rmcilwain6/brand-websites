import { prisma } from '@repo/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import CopyCodeButton from '../components/CopyCodeButton';
import SendVoucherForm from '../components/SendVoucherForm';
import VoucherEditor from '../components/VoucherEditor';
import {
  VoucherStatusBadge,
  fmtVoucherDay,
  isVoucherExpired,
  voucherDiscountLabel
} from '../components/voucher-display';

export const dynamic = 'force-dynamic';

/** How many recent bookings to offer in the "redeem on" picker. */
const REDEEM_PICKER_LIMIT = 200;

type BookingPayload = { preferredDate?: string };

const isEmail = (v: string | null | undefined): v is string => !!v && /^\S+@\S+\.\S+$/.test(v);

const VoucherDetailPage = async ({ params }: { params: { id: string } }) => {
  const voucher = await prisma.voucher.findUnique({
    where: { id: params.id },
    include: {
      sourceBooking: { select: { id: true, inquiry: { select: { name: true } } } },
      redeemedBooking: { select: { id: true, inquiry: { select: { name: true } } } }
    }
  });

  if (!voucher) notFound();

  const recentBookings = await prisma.bookingRequest.findMany({
    where: voucher.sourceBookingId ? { id: { not: voucher.sourceBookingId } } : {},
    orderBy: { createdAt: 'desc' },
    take: REDEEM_PICKER_LIMIT,
    select: { id: true, createdAt: true, inquiry: { select: { name: true, payload: true } } }
  });
  const bookings = recentBookings.map((b) => {
    const session = (b.inquiry?.payload as BookingPayload | null)?.preferredDate;
    return {
      id: b.id,
      label: [
        b.inquiry?.name ?? 'Unnamed booking',
        session ? `session ${session}` : null,
        `received ${fmtVoucherDay(b.createdAt)}`
      ]
        .filter(Boolean)
        .join(' · ')
    };
  });

  // The thank-you email thanks the holder for a referral, so it's offered only when there was one.
  const isReferral = !!voucher.sourceBooking || !!voucher.referrerName;

  const timeline = [
    { label: 'Created', at: voucher.createdAt },
    { label: 'Sent / activated', at: voucher.activatedAt },
    { label: 'Redeemed', at: voucher.redeemedAt },
    { label: 'Voided', at: voucher.voidedAt }
  ].filter((t): t is { label: string; at: Date } => t.at !== null);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <header>
        <Link href="/vouchers" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to vouchers
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-3xl font-semibold tracking-wider text-slate-900">
            {voucher.code}
          </h1>
          <CopyCodeButton code={voucher.code} />
          <VoucherStatusBadge status={voucher.status} expiresAt={voucher.expiresAt} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {voucherDiscountLabel(voucher)} ·{' '}
          {voucher.expiresAt ? `good until ${fmtVoucherDay(voucher.expiresAt)}` : 'no expiry'} ·{' '}
          {voucher.type.charAt(0) + voucher.type.slice(1).toLowerCase()}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Where it came from
        </h2>
        <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          <Row label="Source">
            {voucher.sourceBooking ? (
              <>
                Earned by referring{' '}
                <Link
                  href={`/bookings/${voucher.sourceBooking.id}`}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {voucher.sourceBooking.inquiry?.name ?? 'a booking'}
                </Link>
              </>
            ) : (
              'Created by hand'
            )}
          </Row>
          {voucher.referrerName && (
            <Row label="Referrer">
              {voucher.referrerName}
              {voucher.referrerContact && (
                <span className="text-slate-500"> · {voucher.referrerContact}</span>
              )}
            </Row>
          )}
          <Row label="Holder">
            {voucher.holderName ?? <span className="text-slate-400">No holder</span>}
            {voucher.holderContact && (
              <span className="text-slate-500"> · {voucher.holderContact}</span>
            )}
          </Row>
          {voucher.redeemedBooking && (
            <Row label="Used on">
              <Link
                href={`/bookings/${voucher.redeemedBooking.id}`}
                className="text-indigo-600 hover:text-indigo-500"
              >
                {voucher.redeemedBooking.inquiry?.name ?? 'a booking'}
              </Link>
            </Row>
          )}
          {timeline.map((t) => (
            <Row key={t.label} label={t.label}>
              {fmtVoucherDay(t.at)}
            </Row>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Send code
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4">
          {isReferral ? (
            <>
              <p className="text-sm text-slate-600">
                Emails {voucher.holderName ?? 'the holder'} the referral thank-you with this code
                {voucher.sourceBooking?.inquiry?.name
                  ? `, thanking them for sending ${voucher.sourceBooking.inquiry.name}`
                  : ''}
                .
              </p>
              {voucher.activatedAt && (
                <p className="mt-1 text-xs text-slate-500">
                  First sent {fmtVoucherDay(voucher.activatedAt)}.
                </p>
              )}
              <SendVoucherForm
                voucherId={voucher.id}
                status={voucher.status}
                expired={isVoucherExpired(voucher)}
                suggestedEmail={
                  [voucher.holderContact, voucher.referrerContact].find(isEmail) ?? ''
                }
              />
            </>
          ) : (
            <p className="text-sm text-slate-500">
              The only email so far is the referral thank-you, which doesn&apos;t fit a voucher with
              no referrer. Copy the code and send it yourself, then set the status to Active.
            </p>
          )}
        </div>
      </section>

      <VoucherEditor
        voucher={{
          id: voucher.id,
          status: voucher.status,
          holderName: voucher.holderName,
          holderContact: voucher.holderContact,
          expiresOn: voucher.expiresAt ? voucher.expiresAt.toISOString().slice(0, 10) : '',
          notes: voucher.notes,
          discountType: voucher.discountType,
          amountCents: voucher.amountCents,
          percentOff: voucher.percentOff,
          redeemedBookingId: voucher.redeemedBookingId
        }}
        bookings={bookings}
      />
    </main>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[120px_1fr] gap-4 px-4 py-3">
    <dt className="pt-0.5 text-xs font-medium text-slate-500">{label}</dt>
    <dd className="text-sm text-slate-800">{children}</dd>
  </div>
);

export default VoucherDetailPage;
