import { APPLICANT_STATUS_LABELS, CAMPAIGN, campaignLabel } from '@repo/core';
import { prisma } from '@repo/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type BookingPayload = {
  location?: string;
  packageName?: string | null;
  preferredDate?: string;
  preferredTime?: string | null;
};

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  REVIEWED: 'bg-blue-50 text-blue-700 border-blue-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DECLINED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-slate-50 text-slate-500 border-slate-200'
};

const chip = (active: boolean) =>
  `rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'border-indigo-600 bg-indigo-600 text-white'
      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
  }`;

const BookingsPage = async ({ searchParams }: { searchParams: { campaign?: string } }) => {
  // The current round, plus any earlier round that has bookings.
  const withCampaign = await prisma.bookingRequest.findMany({
    where: { campaign: { not: null } },
    distinct: ['campaign'],
    select: { campaign: true }
  });
  const campaigns = [
    ...new Set([CAMPAIGN.id, ...withCampaign.flatMap((b) => b.campaign ?? [])])
  ] as string[];
  const campaign = campaigns.find((c) => c === searchParams.campaign);

  const bookings = await prisma.bookingRequest.findMany({
    where: campaign ? { campaign } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      inquiry: {
        select: { name: true, email: true, payload: true, createdAt: true }
      },
      package: { select: { name: true } }
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Bookings</h1>
        <p className="mt-1 text-sm text-slate-500">
          {bookings.length} {bookings.length === 1 ? 'request' : 'requests'}
          {campaign ? ' matching the filter' : ''}
        </p>
      </header>

      <nav aria-label="Filter by campaign" className="flex flex-wrap gap-2">
        <Link href="/bookings" className={chip(!campaign)}>
          All bookings
        </Link>
        {campaigns.map((c) => (
          <Link
            key={c}
            href={`/bookings?campaign=${encodeURIComponent(c)}`}
            className={chip(campaign === c)}
          >
            {campaignLabel(c)}
          </Link>
        ))}
      </nav>

      <div className="rounded-lg border border-slate-200 bg-white">
        {bookings.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            {campaign ? 'No applications yet.' : 'No booking requests yet.'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {bookings.map((booking) => {
              const payload = booking.inquiry?.payload as BookingPayload | null;

              const emailStatus = booking.emailSentAt
                ? { label: 'Email sent', cls: 'text-emerald-600' }
                : booking.emailError
                  ? { label: 'Email failed', cls: 'text-rose-600' }
                  : { label: 'Not sent', cls: 'text-slate-400' };

              return (
                <li key={booking.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-900">
                        {booking.inquiry?.name ?? '—'}
                      </p>
                      <span
                        className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium ${statusStyles[booking.status] ?? statusStyles.PENDING}`}
                      >
                        {booking.status}
                      </span>
                      {booking.campaign && (
                        <span
                          title={`Applied to ${campaignLabel(booking.campaign)}`}
                          className="shrink-0 rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-xs font-medium text-orange-700"
                        >
                          Passion Projects
                          {booking.applicantStatus &&
                            ` · ${APPLICANT_STATUS_LABELS[booking.applicantStatus]}`}
                        </span>
                      )}
                      {booking.referrerName && (
                        <span
                          title={`Referred by ${booking.referrerName}`}
                          className="shrink-0 rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-xs font-medium text-violet-700"
                        >
                          Referral
                        </span>
                      )}
                      {booking.voucherCodeEntered && (
                        <span
                          title={`Entered voucher code ${booking.voucherCodeEntered}`}
                          className="shrink-0 rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-700"
                        >
                          Voucher
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-slate-500">{booking.inquiry?.email}</p>
                  </div>

                  <div className="hidden w-36 shrink-0 sm:block">
                    <p className="truncate text-sm text-slate-700">
                      {booking.package?.name ?? payload?.packageName ?? (
                        <span className="text-slate-400">No package</span>
                      )}
                    </p>
                  </div>

                  <div className="hidden w-28 shrink-0 md:block">
                    <p className="text-sm text-slate-700">{payload?.preferredDate ?? '—'}</p>
                  </div>

                  <div className="hidden w-24 shrink-0 lg:block">
                    <p className={`text-xs font-medium ${emailStatus.cls}`}>{emailStatus.label}</p>
                  </div>

                  <div className="shrink-0">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      View →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
};

export default BookingsPage;
