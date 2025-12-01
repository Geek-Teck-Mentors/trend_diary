-- AlterTable
ALTER TABLE "public"."roles" ADD COLUMN "preset" BOOLEAN NOT NULL DEFAULT false;

-- Add column comment
COMMENT ON COLUMN "public"."roles"."preset" IS 'プリセットフラグ：システムデフォルトのロールかどうか';
