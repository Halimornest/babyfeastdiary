-- Reclassify existing UMAMI rows before removing enum value
-- Idempotent by design so it is safe to re-run.

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'Seasoning'
			AND column_name = 'category'
	) THEN
		ALTER TABLE "Seasoning" ALTER COLUMN "category" DROP DEFAULT;
	END IF;
END $$;

UPDATE "Seasoning"
SET "category" = 'AROMATIC'
WHERE "category"::text = 'UMAMI';

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM pg_type t
		JOIN pg_enum e ON e.enumtypid = t.oid
		WHERE t.typname = 'SeasoningCategory'
			AND e.enumlabel = 'UMAMI'
	) THEN
		IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SeasoningCategory_old') THEN
			DROP TYPE "SeasoningCategory_old";
		END IF;

		ALTER TYPE "SeasoningCategory" RENAME TO "SeasoningCategory_old";
		CREATE TYPE "SeasoningCategory" AS ENUM ('AROMATIC', 'SPICE', 'FAT', 'HERB');

		ALTER TABLE "Seasoning"
		ALTER COLUMN "category" TYPE "SeasoningCategory"
		USING ("category"::text::"SeasoningCategory");

		DROP TYPE "SeasoningCategory_old";
	END IF;
END $$;

ALTER TABLE "Seasoning" ALTER COLUMN "category" SET DEFAULT 'AROMATIC';
