-- Revert global modifier library migration
-- Restores PackageModifier to self-contained modifiers (name, type, price, config per package)

-- Clear existing assignments (no real data)
TRUNCATE TABLE "PackageModifier";

-- Drop constraints and indexes added by the forward migration
ALTER TABLE "PackageModifier" DROP CONSTRAINT IF EXISTS "PackageModifier_modifierId_fkey";
DROP INDEX IF EXISTS "PackageModifier_packageId_modifierId_key";
DROP INDEX IF EXISTS "PackageModifier_modifierId_idx";

-- Remove modifierId column
ALTER TABLE "PackageModifier" DROP COLUMN IF EXISTS "modifierId";

-- Restore original columns
ALTER TABLE "PackageModifier"
    ADD COLUMN "name" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "description" TEXT,
    ADD COLUMN "type" "ModifierType" NOT NULL DEFAULT 'CHECKBOX',
    ADD COLUMN "priceDeltaCents" INTEGER,
    ADD COLUMN "config" JSONB;

-- Remove the temporary default on name
ALTER TABLE "PackageModifier" ALTER COLUMN "name" DROP DEFAULT;

-- Restore original unique constraint and index
CREATE UNIQUE INDEX "PackageModifier_packageId_name_key" ON "PackageModifier"("packageId", "name");

-- Drop the Modifier table
DROP TABLE IF EXISTS "Modifier";
