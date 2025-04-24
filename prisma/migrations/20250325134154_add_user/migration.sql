-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGSERIAL NOT NULL,
    "account_id" BIGINT NOT NULL,
    "display_name" VARCHAR(1024),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- コメントをつける（手動）
COMMENT ON COLUMN "users"."user_id" IS 'グローバルなID, クライアントには公開しない';
COMMENT ON COLUMN "users"."account_id" IS 'グローバルなID, クライアントには公開しない';
COMMENT ON COLUMN "users"."display_name" IS '表示名';
COMMENT ON COLUMN "users"."created_at" IS '作成日時';
COMMENT ON COLUMN "users"."updated_at" IS '更新日時';
