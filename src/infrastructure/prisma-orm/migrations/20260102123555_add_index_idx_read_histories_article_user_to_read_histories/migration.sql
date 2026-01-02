-- CreateIndex
CREATE INDEX "idx_read_histories_article_user" ON "public"."read_histories"("article_id", "active_user_id");
