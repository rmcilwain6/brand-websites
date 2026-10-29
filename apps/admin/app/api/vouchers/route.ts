import {
  VOUCHER_STATUSES,
  VOUCHER_TYPES,
  VoucherCreateSchema,
  createApiError,
  generateVoucherCode,
  jsonError,
  jsonOk,
  parseJson,
  voucherDiscountColumns,
  type VoucherStatus,
  type VoucherType
} from '@repo/core';
import { PrismaClientKnownRequestError, prisma } from '@repo/db';

import { requireAdminSession } from '../../lib/auth';

/** Generated codes are random, so a clash is rare; retry with a fresh code a few times. */
const MAX_CODE_ATTEMPTS = 5;

const isCodeCollision = (error: unknown): boolean =>
  error instanceof PrismaClientKnownRequestError &&
  error.code === 'P2002' &&
  [error.meta?.target].flat().some((t) => typeof t === 'string' && t.includes('code'));

const oneOf = <T extends string>(values: readonly T[], value: string | null): T | undefined =>
  values.find((v) => v === value);

/** Vouchers, newest first. Optional `?status=` and `?type=` filters. */
export const GET = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const params = new URL(req.url).searchParams;
  const status = oneOf<VoucherStatus>(VOUCHER_STATUSES, params.get('status'));
  const type = oneOf<VoucherType>(VOUCHER_TYPES, params.get('type'));

  const vouchers = await prisma.voucher.findMany({
    where: { status, type },
    orderBy: { createdAt: 'desc' }
  });

  return jsonOk(vouchers);
};

/** Creates a voucher by hand. It starts PENDING; the holder defaults to the referrer. */
export const POST = async (req: Request): Promise<Response> => {
  const authError = requireAdminSession(req);
  if (authError) return authError;

  const result = await parseJson(req, VoucherCreateSchema);
  if (!result.ok) return jsonError(result.error);

  const { type, referrerName, referrerContact, holderName, holderContact, expiresAt, notes } =
    result.data;
  const discount =
    result.data.discountType === 'FIXED_AMOUNT'
      ? { discountType: result.data.discountType, amountCents: result.data.amountCents }
      : { discountType: result.data.discountType, percentOff: result.data.percentOff };

  const data = {
    type,
    ...voucherDiscountColumns(discount),
    referrerName: referrerName || null,
    referrerContact: referrerContact || null,
    holderName: holderName || referrerName || null,
    holderContact: holderContact || referrerContact || null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    notes: notes || null
  };

  for (let attempt = 1; ; attempt++) {
    try {
      const voucher = await prisma.voucher.create({
        data: { ...data, code: generateVoucherCode() }
      });
      return jsonOk(voucher, { status: 201 });
    } catch (error) {
      if (isCodeCollision(error) && attempt < MAX_CODE_ATTEMPTS) continue;
      console.error('[vouchers] Create failed', error);
      return jsonError(createApiError('INTERNAL', 'Unable to create voucher.'));
    }
  }
};
