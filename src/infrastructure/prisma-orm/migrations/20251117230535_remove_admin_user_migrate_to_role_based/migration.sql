-- AlterTable: Add granted_by_active_user_id to user_roles
ALTER TABLE "public"."user_roles" ADD COLUMN "granted_by_active_user_id" BIGINT;

-- Add column comment
COMMENT ON COLUMN "public"."user_roles"."granted_by_active_user_id" IS '付与者のアクティブユーザーID：誰がこのロールを付与したか';
