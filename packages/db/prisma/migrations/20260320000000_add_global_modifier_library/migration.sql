-- Clear existing package modifier test data (no real production data yet)
TRUNCATE TABLE "PackageModifier";

-- Drop old unique constraint on (packageId, name)
DROP INDEX IF EXISTS "PackageModifier_packageId_name_key";

-- CreateTable: global Modifier library
CREATE TABLE "Modifier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ModifierType" NOT NULL DEFAULT 'CHECKBOX',
    "priceDeltaCents" INTEGER,
    "config" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modifier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique modifier name
CREATE UNIQUE INDEX "Modifier_name_key" ON "Modifier"("name");

-- AlterTable: drop definition columns, add modifierId reference
ALTER TABLE "PackageModifier"
    DROP COLUMN "name",
    DROP COLUMN "description",
    DROP COLUMN "type",
    DROP COLUMN "priceDeltaCents",
    DROP COLUMN "config",
    ADD COLUMN "modifierId" TEXT NOT NULL;

-- AddForeignKey: PackageModifier -> Modifier
ALTER TABLE "PackageModifier" ADD CONSTRAINT "PackageModifier_modifierId_fkey"
    FOREIGN KEY ("modifierId") REFERENCES "Modifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex: unique assignment per package
CREATE UNIQUE INDEX "PackageModifier_packageId_modifierId_key" ON "PackageModifier"("packageId", "modifierId");

-- CreateIndex: index on modifierId
CREATE INDEX "PackageModifier_modifierId_idx" ON "PackageModifier"("modifierId");
