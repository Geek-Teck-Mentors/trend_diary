/*
  Warnings:

  - A unique constraint covering the columns `[active_user_id,article_id]` on the table `read_histories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "read_histories_active_user_id_article_id_key" ON "public"."read_histories"("active_user_id", "article_id");
