-- CreateEnum
CREATE TYPE "ModifierType" AS ENUM ('CHECKBOX', 'TOGGLE', 'SLIDER', 'INCREMENTER');

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "deliverables" TEXT[],
ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "summaryLine" TEXT;

-- AlterTable
ALTER TABLE "PackageModifier" ADD COLUMN     "config" JSONB,
ADD COLUMN     "isIncluded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "ModifierType" NOT NULL DEFAULT 'CHECKBOX';
