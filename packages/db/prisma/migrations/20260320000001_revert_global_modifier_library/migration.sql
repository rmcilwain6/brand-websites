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

-- Restore original columns (conditional to handle both fresh DBs and ones that had the forward migration applied)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PackageModifier' AND column_name='name') THEN
        ALTER TABLE "PackageModifier" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';
        ALTER TABLE "PackageModifier" ALTER COLUMN "name" DROP DEFAULT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PackageModifier' AND column_name='description') THEN
        ALTER TABLE "PackageModifier" ADD COLUMN "description" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PackageModifier' AND column_name='type') THEN
        ALTER TABLE "PackageModifier" ADD COLUMN "type" "ModifierType" NOT NULL DEFAULT 'CHECKBOX';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PackageModifier' AND column_name='priceDeltaCents') THEN
        ALTER TABLE "PackageModifier" ADD COLUMN "priceDeltaCents" INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PackageModifier' AND column_name='config') THEN
        ALTER TABLE "PackageModifier" ADD COLUMN "config" JSONB;
    END IF;
END$$;

-- Restore original unique constraint and index
CREATE UNIQUE INDEX IF NOT EXISTS "PackageModifier_packageId_name_key" ON "PackageModifier"("packageId", "name");

-- Drop the Modifier table
DROP TABLE IF EXISTS "Modifier";
