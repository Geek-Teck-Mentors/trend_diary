import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Article, Cursor, Direction } from './types';
import getApiClientForClient from '../../infrastructure/api';

const date = new Date();

export default function useTrends() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [cursor, setCursor] = useState<Cursor>({});
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  const fetchArticles = useCallback(
    async (direction: Direction = 'next') => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const client = getApiClientForClient();

        const res = await client.articles.$get({
          query: {
            direction,
            cursor: cursor[direction],
            limit: 10,
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

  const openDrawer = (article: Article) => {
    setSelectedArticle(article);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedArticle(null), 300);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoading && cursor.next) {
          // INFO: 自動読み込みなので結果を待つ必要がないためあえてawaitしない
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          fetchArticles('next');
        }
      },
      { threshold: 0.1 },
    );

    if (observerTargetRef.current) {
      observer.observe(observerTargetRef.current);
    }

    return () => observer.disconnect();
  }, [fetchArticles, isLoading, cursor.next]);

  return {
    articles,
    fetchArticles,
    date,
    selectedArticle,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    isLoading,
    observerTargetRef,
  };
}
