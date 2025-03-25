-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMPTZ;
COMMENT ON COLUMN "users"."deleted_at" IS '削除日時';

-- CreateTable
CREATE TABLE "accounts" (
    "account_id" BIGSERIAL NOT NULL,
    "email" VARCHAR(1024) NOT NULL,
    "password" VARCHAR(1024) NOT NULL,
    "last_login" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- コメントをつける（手動）
COMMENT ON COLUMN "accounts"."account_id" IS 'グローバルなID, クライアントには公開しない';
COMMENT ON COLUMN "accounts"."email" IS 'メールアドレス';
COMMENT ON COLUMN "accounts"."password" IS 'パスワード';
COMMENT ON COLUMN "accounts"."last_login" IS '最終ログイン日時';
COMMENT ON COLUMN "accounts"."created_at" IS '作成日時';
COMMENT ON COLUMN "accounts"."updated_at" IS '更新日時';
COMMENT ON COLUMN "accounts"."deleted_at" IS '削除日時';
