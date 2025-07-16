import { useCallback, useEffect, useState } from "react";
import getApiClientForClient from "../../infrastructure/api";
import { toast } from "sonner";
import { PaginationCursor, PaginationDirection } from "../../types/paginations";
import { Article } from "./types";

const formatDate = (rawDate: Date) => {
  const year = rawDate.getFullYear();
  const month = String(rawDate.getMonth() + 1).padStart(2, "0");
  const day = String(rawDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function useTrends() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [cursor, setCursor] = useState<PaginationCursor>({});
  const [isLoading, setIsLoading] = useState(false);

  const date = new Date();

  const fetchArticles = useCallback(
    async ({
      date = new Date(),
      direction = "next",
      limit = 20,
    }: {
      date?: Date;
      direction?: PaginationDirection;
      limit?: number;
    }) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const client = getApiClientForClient();

        const queryDate = formatDate(date);

        const res = await client.articles.$get({
          query: {
            to: queryDate,
            from: queryDate,
            direction,
            cursor: cursor[direction],
            limit,
          },
        });
        if (res.status === 200) {
          const resJson = await res.json();
          setArticles(
            resJson.data.map((data) => ({
              articleId: Number(data.articleId),
              media: data.media,
              title: data.title,
              author: data.author,
              description: data.description,
              url: data.url,
              createdAt: new Date(data.createdAt),
            })),
          );
          setCursor({
            next: resJson.nextCursor,
            prev: resJson.prevCursor,
          });
          // 400番台
        } else if (res.status >= 400 && res.status < 500) {
          toast.error("記事の取得に失敗しました");
        } else if (res.status >= 500) {
          toast.error("サーバーエラーが発生しました");
        } else {
          toast.error("エラーが発生しました");
        }
      } catch (_error) {
        toast.error("エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    },
    [cursor, isLoading],
  );

  // INFO: 初回読み込み時に今日の日付で記事を取得
  useEffect(() => {
    fetchArticles({ date });
  }, []);

  const handleNextPage = useCallback(async () => {
    if (cursor.next) {
      await fetchArticles({ date, direction: "next" });
    }
  }, [fetchArticles, cursor.next, date]);

  const handlePrevPage = useCallback(async () => {
    if (cursor.prev) {
      await fetchArticles({ date, direction: "prev" });
    }
  }, [fetchArticles, cursor.prev, date]);

  return {
    date,
    articles,
    cursor,
    isLoading,
    handleNextPage,
    handlePrevPage,
  };
}
