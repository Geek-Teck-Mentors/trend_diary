-- AlterTable: Add granted_by_active_user_id to user_roles
ALTER TABLE "public"."user_roles" ADD COLUMN "granted_by_active_user_id" BIGINT;

-- Add column comment
COMMENT ON COLUMN "public"."user_roles"."granted_by_active_user_id" IS '付与者のアクティブユーザーID：誰がこのロールを付与したか';

-- Migrate data from admin_users to user_roles
-- admin_users テーブルのデータを user_roles テーブルに移行
INSERT INTO "public"."user_roles" ("active_user_id", "role_id", "granted_at", "granted_by_active_user_id")
SELECT
  au."active_user_id",
  (SELECT "role_id" FROM "public"."roles" WHERE "display_name" = '管理者' LIMIT 1) as role_id,
  au."granted_at",
  granter."active_user_id"
FROM "public"."admin_users" au
LEFT JOIN "public"."admin_users" granter ON au."granted_by_admin_user_id" = granter."admin_user_id"
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."user_roles" ur
  WHERE ur."active_user_id" = au."active_user_id"
  AND ur."role_id" = (SELECT "role_id" FROM "public"."roles" WHERE "display_name" = '管理者' LIMIT 1)
)
AND (SELECT "role_id" FROM "public"."roles" WHERE "display_name" = '管理者' LIMIT 1) IS NOT NULL;

-- DropTable: Remove admin_users table
DROP TABLE IF EXISTS "public"."admin_users";
