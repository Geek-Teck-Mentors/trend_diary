-- 重複するURLが存在する場合、それらを削除する
WITH duplicates AS (
    SELECT article_id
    FROM (
        SELECT
            article_id,
            ROW_NUMBER() OVER (PARTITION BY url ORDER BY article_id ASC) as row_num
        FROM "public"."articles"
    ) partitioned
    WHERE row_num > 1
)
DELETE FROM "public"."articles"
WHERE article_id IN (SELECT article_id FROM duplicates);


-- CreateIndex
CREATE UNIQUE INDEX "articles_url_key" ON "public"."articles"("url");
