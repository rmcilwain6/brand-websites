import {
  buildModifierLineItems,
  formatVoucherDiscount,
  heardFromLabel,
  toVoucherDiscount
} from '@repo/core';
import { prisma } from '@repo/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { sameName } from '../../lib/booking-email-data';

import BookingActions from './BookingActions';
import ReferralVoucherCard from './ReferralVoucherCard';

export const dynamic = 'force-dynamic';

type BookingPayload = {
  location?: string;
  packageName?: string | null;
  modifierIds?: string[];
  modifierValues?: Record<string, number> | null;
  estimatedTotalCents?: number | null;
  preferredDate?: string;
  preferredTime?: string | null;
};

type SelectedOptions = {
  modifierIds?: string[];
  modifierValues?: Record<string, number>;
};

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  REVIEWED: 'bg-blue-50 text-blue-700 border-blue-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DECLINED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-slate-50 text-slate-500 border-slate-200'
};

const fmt = (cents: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(cents / 100);

const fmtDelta = (cents: number | null): string => {
  if (cents === null || cents === 0) return 'Included';
  if (cents > 0) return `+${fmt(cents)}`;
  return `−${fmt(Math.abs(cents))}`;
};

const BookingDetailPage = async ({ params }: { params: { id: string } }) => {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: params.id },
    include: {
      inquiry: true,
      package: { include: { modifiers: { orderBy: { sortOrder: 'asc' } } } },
      timeSlot: true,
      referralVoucher: true
    }
  });

  if (!booking) notFound();

  const voucher = booking.referralVoucher;
  const voucherDiscount = voucher && toVoucherDiscount(voucher);
  const isEmail = (v: string | null | undefined): v is string => !!v && /^\S+@\S+\.\S+$/.test(v);
  const fmtDay = (d: Date) =>
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });

  const inquiry = booking.inquiry;
  const payload = inquiry?.payload as BookingPayload | null;
  const selectedOptions = booking.selectedOptions as SelectedOptions | null;
  const heardFrom = heardFromLabel(booking.heardFrom);
  const selfReferral =
    !!booking.referrerName && !!inquiry?.name && sameName(booking.referrerName, inquiry.name);

  const modifierLineItems =
    booking.package && selectedOptions
      ? buildModifierLineItems(booking.package.modifiers, {
          selectedIds: selectedOptions.modifierIds ?? [],
          values: selectedOptions.modifierValues ?? {}
        })
      : null;

  const emailStatus = booking.emailSentAt
    ? {
        label: 'Sent',
        cls: 'text-emerald-600',
        detail: new Date(booking.emailSentAt).toLocaleString('en-CA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    : booking.emailError
      ? { label: 'Failed', cls: 'text-rose-600', detail: booking.emailError }
      : { label: 'Not sent', cls: 'text-slate-400', detail: null };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <header>
        <Link href="/bookings" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to bookings
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">{inquiry?.name ?? 'Booking'}</h1>
          <span
            className={`rounded border px-2 py-0.5 text-xs font-medium ${statusStyles[booking.status] ?? ''}`}
          >
            {booking.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Received{' '}
          {new Date(booking.createdAt).toLocaleString('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </header>

      {/* Contact */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Contact
        </h2>
        <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          <Row label="Name" value={inquiry?.name ?? '—'} />
          <Row
            label="Email"
            value={inquiry?.email ?? '—'}
            href={inquiry?.email ? `mailto:${inquiry.email}` : undefined}
          />
          {inquiry?.phone && (
            <Row label="Phone" value={inquiry.phone} href={`tel:${inquiry.phone}`} />
          )}
        </dl>
      </section>

      {/* Booking details */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Booking details
        </h2>
        <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {payload?.location && <Row label="Location" value={payload.location} />}
          {booking.locationIdeas && (
            <Row label="Location ideas" value={booking.locationIdeas} multiline />
          )}
          {payload?.preferredDate && (
            <Row
              label="Preferred date"
              value={
                payload.preferredTime
                  ? `${payload.preferredDate} at ${payload.preferredTime}`
                  : payload.preferredDate
              }
            />
          )}
          {(booking.package?.name ?? payload?.packageName) && (
            <Row label="Package" value={booking.package?.name ?? payload?.packageName ?? '—'} />
          )}
          {inquiry?.message && <Row label="Notes" value={inquiry.message} multiline />}
          {heardFrom && <Row label="Heard about us" value={heardFrom} />}
        </dl>
      </section>

      {/* Modifier receipt */}
      {modifierLineItems && modifierLineItems.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Package breakdown
          </h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {booking.package?.basePriceCents != null && (
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-slate-900">
                      {booking.package.name} package
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-900">
                      {fmt(booking.package.basePriceCents)}
                    </td>
                  </tr>
                )}
                {modifierLineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-slate-700">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.displayValue ?? ''}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">
                      {fmtDelta(item.priceDeltaCents)}
                    </td>
                  </tr>
                ))}
                {payload?.estimatedTotalCents != null && (
                  <tr className="border-t-2 border-slate-200 font-semibold">
                    <td colSpan={2} className="px-4 py-3 text-slate-900">
                      Estimated total
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-900">
                      {fmt(payload.estimatedTotalCents)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Referral */}
      {booking.referrerName && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Referral
          </h2>
          {selfReferral && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              The referrer’s name matches the booker’s. This may be a self-referral, so check before
              sending the voucher.
            </p>
          )}
          <dl className="mb-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            <Row label="Referred by" value={booking.referrerName} />
            {booking.referrerContact && (
              <Row label="Their contact" value={booking.referrerContact} />
            )}
          </dl>
          {voucher && (
            <ReferralVoucherCard
              voucherId={voucher.id}
              code={voucher.code}
              status={voucher.status}
              discountLabel={
                voucherDiscount ? `${formatVoucherDiscount(voucherDiscount)} off` : null
              }
              expiresLabel={voucher.expiresAt ? fmtDay(voucher.expiresAt) : null}
              expired={!!voucher.expiresAt && voucher.expiresAt < new Date()}
              holderName={voucher.holderName}
              suggestedEmail={[voucher.holderContact, booking.referrerContact].find(isEmail) ?? ''}
              sentLabel={voucher.activatedAt ? fmtDay(voucher.activatedAt) : null}
            />
          )}
        </section>
      )}

      {/* Email status */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Email status
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4">
          <p className={`font-medium ${emailStatus.cls}`}>{emailStatus.label}</p>
          {emailStatus.detail && (
            <p className="mt-1 break-all text-xs text-slate-500">{emailStatus.detail}</p>
          )}
        </div>
      </section>

      {/* Actions */}
      <BookingActions
        bookingId={booking.id}
        currentStatus={booking.status}
        emailSentAt={booking.emailSentAt?.toISOString() ?? null}
      />
    </main>
  );
};

const Row = ({
  label,
  value,
  href,
  multiline
}: {
  label: string;
  value: string;
  href?: string;
  multiline?: boolean;
}) => (
  <div className="grid grid-cols-[120px_1fr] gap-4 px-4 py-3">
    <dt className="pt-0.5 text-xs font-medium text-slate-500">{label}</dt>
    <dd className={`text-sm text-slate-800 ${multiline ? 'whitespace-pre-wrap' : ''}`}>
      {href ? (
        <a href={href} className="text-indigo-600 hover:text-indigo-500">
          {value}
        </a>
      ) : (
        value
      )}
    </dd>
  </div>
);

export default BookingDetailPage;
