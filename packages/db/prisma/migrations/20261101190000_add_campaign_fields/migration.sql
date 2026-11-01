-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'NOT_FEATURED');

-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "applicantStatus" "ApplicantStatus",
ADD COLUMN     "campaign" TEXT,
ADD COLUMN     "campaignAnswers" JSONB;

-- CreateIndex
CREATE INDEX "BookingRequest_campaign_idx" ON "BookingRequest"("campaign");
