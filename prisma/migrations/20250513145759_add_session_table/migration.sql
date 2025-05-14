-- CreateTable
CREATE TABLE "sessions" (
    "session_id" VARCHAR(255) NOT NULL,
    "account_id" BIGINT NOT NULL,
    "session_token" VARCHAR(255),
    "expires_at" TIMESTAMPTZ NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_id")
);

-- コメントをつける（手動）
COMMENT ON COLUMN "sessions"."session_id" IS 'セッションID';
COMMENT ON COLUMN "sessions"."account_id" IS 'グローバルなID, クライアントには公開しない';
COMMENT ON COLUMN "sessions"."session_token" IS 'セッショントークン';
COMMENT ON COLUMN "sessions"."expires_at" IS '有効期限';
COMMENT ON COLUMN "sessions"."ip_address" IS 'IPアドレス';
COMMENT ON COLUMN "sessions"."user_agent" IS 'ユーザーエージェント';
COMMENT ON COLUMN "sessions"."created_at" IS '作成日時';

