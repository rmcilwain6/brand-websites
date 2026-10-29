import { VOUCHER_STATUSES, VOUCHER_TYPES, type VoucherStatus } from '@repo/core';
import { type Prisma, prisma } from '@repo/db';
import Link from 'next/link';

import CopyCodeButton from './components/CopyCodeButton';
import {
  VoucherStatusBadge,
  fmtVoucherDay,
  isVoucherExpired,
  voucherDiscountLabel
} from './components/voucher-display';

export const dynamic = 'force-dynamic';

/** Status filters. EXPIRED is computed: PENDING or ACTIVE and past its expiry date. */
const STATUS_FILTERS = [...VOUCHER_STATUSES, 'EXPIRED'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

const VouchersPage = async ({
  searchParams
}: {
  searchParams: { status?: string; type?: string };
}) => {
  const status = STATUS_FILTERS.find((s) => s === searchParams.status);
  const type = VOUCHER_TYPES.find((t) => t === searchParams.type);
  const now = new Date();

  const statusWhere = (s: StatusFilter | undefined): Prisma.VoucherWhereInput => {
    if (!s) return {};
    if (s === 'EXPIRED') return { status: { in: ['PENDING', 'ACTIVE'] }, expiresAt: { lt: now } };
    const usable = s === 'PENDING' || s === 'ACTIVE';
    // A usable status excludes the expired ones, which have their own filter.
    return usable
      ? { status: s as VoucherStatus, OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }
      : { status: s as VoucherStatus };
  };

  const vouchers = await prisma.voucher.findMany({
    where: { ...statusWhere(status), ...(type && { type }) },
    orderBy: { createdAt: 'desc' },
    include: {
      sourceBooking: { select: { id: true, inquiry: { select: { name: true } } } },
      redeemedBooking: { select: { id: true, inquiry: { select: { name: true } } } }
    }
  });

  const href = (next: { status?: string; type?: string }) => {
    const params = new URLSearchParams();
    const s = 'status' in next ? next.status : status;
    const t = 'type' in next ? next.type : type;
    if (s) params.set('status', s);
    if (t) params.set('type', t);
    const qs = params.toString();
    return qs ? `/vouchers?${qs}` : '/vouchers';
  };

  const chip = (active: boolean) =>
    `rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? 'border-indigo-600 bg-indigo-600 text-white'
        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
    }`;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-16">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Vouchers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {vouchers.length} {vouchers.length === 1 ? 'voucher' : 'vouchers'}
            {status || type ? ' matching the filters' : ''}
          </p>
        </div>
        <Link
          href="/vouchers/new"
          className="shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          New voucher
        </Link>
      </header>

      <div className="flex flex-col gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
          <Link href={href({ status: undefined })} className={chip(!status)}>
            All
          </Link>
          {STATUS_FILTERS.map((s) => (
            <Link key={s} href={href({ status: s })} className={chip(status === s)}>
              {label(s)}
            </Link>
          ))}
        </nav>
        {/* Only one type exists today; the filter is here for when more are added. */}
        {VOUCHER_TYPES.length > 1 && (
          <nav aria-label="Filter by type" className="flex flex-wrap gap-2">
            <Link href={href({ type: undefined })} className={chip(!type)}>
              All types
            </Link>
            {VOUCHER_TYPES.map((t) => (
              <Link key={t} href={href({ type: t })} className={chip(type === t)}>
                {label(t)}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {vouchers.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            {status || type ? 'No vouchers match these filters.' : 'No vouchers yet.'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {vouchers.map((v) => {
              const expired = isVoucherExpired(v, now);
              return (
                <li
                  key={v.id}
                  className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:gap-4"
                >
                  <div className="flex w-56 shrink-0 flex-wrap items-center gap-2">
                    <Link
                      href={`/vouchers/${v.id}`}
                      className="font-mono text-sm font-semibold tracking-wider text-slate-900 hover:text-indigo-600"
                    >
                      {v.code}
                    </Link>
                    <CopyCodeButton code={v.code} />
                    <VoucherStatusBadge status={v.status} expiresAt={v.expiresAt} />
                  </div>

                  <div className="w-24 shrink-0 text-sm text-slate-700">
                    {voucherDiscountLabel(v)}
                  </div>

                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate text-slate-800">
                      {v.holderName ?? <span className="text-slate-400">No holder</span>}
                      {v.holderContact && (
                        <span className="text-slate-500"> · {v.holderContact}</span>
                      )}
                    </p>
                    {v.referrerName &&
                      (v.referrerName !== v.holderName ||
                        v.referrerContact !== v.holderContact) && (
                        <p className="truncate text-xs text-slate-500">
                          Referrer: {v.referrerName}
                          {v.referrerContact && ` · ${v.referrerContact}`}
                        </p>
                      )}
                  </div>

                  <div className="w-48 shrink-0 text-xs text-slate-500">
                    {v.sourceBooking ? (
                      <p className="truncate">
                        From{' '}
                        <Link
                          href={`/bookings/${v.sourceBooking.id}`}
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {v.sourceBooking.inquiry?.name ?? 'booking'}
                        </Link>
                      </p>
                    ) : (
                      <p>Created by hand</p>
                    )}
                    {v.redeemedBooking && (
                      <p className="truncate">
                        Used on{' '}
                        <Link
                          href={`/bookings/${v.redeemedBooking.id}`}
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {v.redeemedBooking.inquiry?.name ?? 'booking'}
                        </Link>
                      </p>
                    )}
                  </div>

                  <div
                    className={`w-28 shrink-0 text-xs ${expired ? 'font-medium text-red-600' : 'text-slate-500'}`}
                  >
                    {v.expiresAt ? `Until ${fmtVoucherDay(v.expiresAt)}` : 'No expiry'}
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

export default VouchersPage;
