-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "emailError" TEXT,
ADD COLUMN     "emailSentAt" TIMESTAMP(3);
