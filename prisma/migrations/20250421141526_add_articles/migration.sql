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
