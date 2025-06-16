-- CreateTable
CREATE TABLE "read_histories" (
    "user_id" BIGINT NOT NULL,
    "article_id" BIGINT NOT NULL,
    "read_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "read_histories_pkey" PRIMARY KEY ("user_id","article_id")
);

-- コメントをつける（手動）
COMMENT ON COLUMN "read_histories"."user_id" IS 'ユーザーID';
COMMENT ON COLUMN "read_histories"."article_id" IS '記事ID';
COMMENT ON COLUMN "read_histories"."read_at" IS '記事を読んだ日時';
COMMENT ON COLUMN "read_histories"."created_at" IS '作成日時';
COMMENT ON TABLE "read_histories" IS '読んだ記事の履歴を保存するテーブル';

-- AddForeignKey
ALTER TABLE "read_histories" ADD CONSTRAINT "read_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
