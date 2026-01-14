-- AlterTable
ALTER TABLE "public"."privacy_policy_consents" ALTER COLUMN "consented_at" SET DATA TYPE TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "public"."admin_users" (
    "admin_user_id" SERIAL NOT NULL,
    "active_user_id" BIGINT NOT NULL,
    "granted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granted_by_admin_user_id" INTEGER NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("admin_user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_active_user_id_key" ON "public"."admin_users"("active_user_id");

-- AddForeignKey
ALTER TABLE "public"."admin_users" ADD CONSTRAINT "admin_users_active_user_id_fkey" FOREIGN KEY ("active_user_id") REFERENCES "public"."active_users"("active_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add table comment
COMMENT ON TABLE "public"."admin_users" IS '管理者ユーザーテーブル：システム管理権限を持つユーザーを管理';

-- Add column comments
COMMENT ON COLUMN "public"."admin_users"."admin_user_id" IS '管理者ユーザーID：プライマリキー';
COMMENT ON COLUMN "public"."admin_users"."active_user_id" IS 'アクティブユーザーID：管理者権限を付与されたユーザー';
COMMENT ON COLUMN "public"."admin_users"."granted_at" IS '権限付与日時：管理者権限が付与された日時';
COMMENT ON COLUMN "public"."admin_users"."granted_by_admin_user_id" IS '権限付与者ID：管理者権限を付与したユーザーのID';
