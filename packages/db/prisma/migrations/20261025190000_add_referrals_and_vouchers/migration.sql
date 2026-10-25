-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('REFERRAL');

-- CreateEnum
CREATE TYPE "VoucherDiscountType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('PENDING', 'ACTIVE', 'REDEEMED', 'VOID');

-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "heardFrom" TEXT,
ADD COLUMN     "locationIdeas" TEXT,
ADD COLUMN     "referrerContact" TEXT,
ADD COLUMN     "referrerName" TEXT,
ADD COLUMN     "voucherCodeEntered" TEXT;

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "VoucherType" NOT NULL DEFAULT 'REFERRAL',
    "status" "VoucherStatus" NOT NULL DEFAULT 'PENDING',
    "discountType" "VoucherDiscountType" NOT NULL DEFAULT 'FIXED_AMOUNT',
    "amountCents" INTEGER,
    "percentOff" INTEGER,
    "referrerName" TEXT,
    "referrerContact" TEXT,
    "holderName" TEXT,
    "holderContact" TEXT,
    "sourceBookingId" TEXT,
    "redeemedBookingId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_sourceBookingId_key" ON "Voucher"("sourceBookingId");

-- CreateIndex
CREATE INDEX "Voucher_status_idx" ON "Voucher"("status");

-- CreateIndex
CREATE INDEX "Voucher_type_idx" ON "Voucher"("type");

-- CreateIndex
CREATE INDEX "Voucher_redeemedBookingId_idx" ON "Voucher"("redeemedBookingId");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_sourceBookingId_fkey" FOREIGN KEY ("sourceBookingId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_redeemedBookingId_fkey" FOREIGN KEY ("redeemedBookingId") REFERENCES "BookingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddCheckConstraint (hand-written; Prisma can't express CHECK constraints)
-- A voucher's value matches its discount type: a positive fixed amount, or a whole percent from 1 to 100.
-- The explicit IS NOT NULL checks matter: a CHECK that evaluates to NULL passes.
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_discount_value_check" CHECK (
  ("discountType" = 'FIXED_AMOUNT' AND "amountCents" IS NOT NULL AND "amountCents" > 0 AND "percentOff" IS NULL)
  OR ("discountType" = 'PERCENTAGE' AND "percentOff" IS NOT NULL AND "percentOff" BETWEEN 1 AND 100 AND "amountCents" IS NULL)
);
