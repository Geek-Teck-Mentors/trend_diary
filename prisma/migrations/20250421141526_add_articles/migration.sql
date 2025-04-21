-- CreateTable
CREATE TABLE "articles" (
    "article_id" BIGSERIAL NOT NULL,
    "media" VARCHAR(10) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "author" VARCHAR(30) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("article_id")
);

-- コメントをつける（手動）
COMMENT ON COLUMN "articles"."article_id" IS 'グローバルなID';
COMMENT ON COLUMN "articles"."media" IS 'メディア名';
COMMENT ON COLUMN "articles"."title" IS '記事タイトル';
COMMENT ON COLUMN "articles"."author" IS '著者名';
COMMENT ON COLUMN "articles"."description" IS '記事の概要';
COMMENT ON COLUMN "articles"."url" IS '記事のURL';
COMMENT ON COLUMN "articles"."created_at" IS '作成日時';
