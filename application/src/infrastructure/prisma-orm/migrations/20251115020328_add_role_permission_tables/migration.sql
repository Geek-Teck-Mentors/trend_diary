-- CreateTable
CREATE TABLE "public"."roles" (
    "role_id" SERIAL NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1024),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "permission_id" SERIAL NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "action" VARCHAR(100) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "active_user_id" BIGINT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "granted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("active_user_id","role_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "public"."permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "permissions_resource_idx" ON "public"."permissions"("resource");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "public"."role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "public"."user_roles"("role_id");

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_active_user_id_fkey" FOREIGN KEY ("active_user_id") REFERENCES "public"."active_users"("active_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add table comments
COMMENT ON TABLE "public"."roles" IS 'ロールテーブル：ユーザーの役割を管理';
COMMENT ON TABLE "public"."permissions" IS 'パーミッションテーブル：システムで利用可能な権限のマスタデータ';
COMMENT ON TABLE "public"."role_permissions" IS 'ロール・パーミッション中間テーブル：ロールが持つパーミッションを管理';
COMMENT ON TABLE "public"."user_roles" IS 'ユーザー・ロール中間テーブル：ユーザーが持つロールを管理';

-- Add column comments for roles
COMMENT ON COLUMN "public"."roles"."role_id" IS 'ロールID：プライマリキー';
COMMENT ON COLUMN "public"."roles"."display_name" IS '表示名：ロールの表示名';
COMMENT ON COLUMN "public"."roles"."description" IS '説明：ロールの説明';
COMMENT ON COLUMN "public"."roles"."created_at" IS '作成日時：ロールが作成された日時';

-- Add column comments for permissions
COMMENT ON COLUMN "public"."permissions"."permission_id" IS 'パーミッションID：プライマリキー';
COMMENT ON COLUMN "public"."permissions"."resource" IS 'リソース：操作対象のリソース名';
COMMENT ON COLUMN "public"."permissions"."action" IS 'アクション：実行する操作';

-- Add column comments for role_permissions
COMMENT ON COLUMN "public"."role_permissions"."role_id" IS 'ロールID：外部キー';
COMMENT ON COLUMN "public"."role_permissions"."permission_id" IS 'パーミッションID：外部キー';

-- Add column comments for user_roles
COMMENT ON COLUMN "public"."user_roles"."active_user_id" IS 'アクティブユーザーID：外部キー';
COMMENT ON COLUMN "public"."user_roles"."role_id" IS 'ロールID：外部キー';
COMMENT ON COLUMN "public"."user_roles"."granted_at" IS '付与日時：ロールが付与された日時';
