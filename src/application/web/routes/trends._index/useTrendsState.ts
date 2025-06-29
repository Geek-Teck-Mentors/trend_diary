import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Article } from './types';
import getApiClientForClient from '../../infrastructure/api';
import { PaginationCursor, PaginationDirection } from '../../types/paginations';

const formatDate = (rawDate: Date) => {
  const year = rawDate.getFullYear();
  const month = String(rawDate.getMonth() + 1).padStart(2, '0');
  const day = String(rawDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function useTrendsState() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [cursor, setCursor] = useState<PaginationCursor>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchArticles = useCallback(
    async ({
      date = new Date(),
      direction = 'next',
      limit = 100,
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
          setArticles((prevArticles) => [
            ...prevArticles,
            ...resJson.data.map((data) => ({
              articleId: Number(data.articleId),
              media: data.media,
              title: data.title,
              author: data.author,
              description: data.description,
              url: data.url,
              createdAt: new Date(data.createdAt),
            })),
          ]);
          setCursor({
            next: resJson.nextCursor,
            prev: resJson.prevCursor,
          });
        } else {
          toast.error('エラーが発生しました');
        }
      } catch (error) {
        toast.error('エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    },
    [cursor, isLoading],
  );

  return {
    articles,
    cursor,
    fetchArticles,
    isLoading,
  };
}
