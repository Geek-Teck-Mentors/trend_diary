import { useEffect, useRef } from "react";
import { Cursor, Direction } from "./types"

type Params = {
  fetchArticles: (params: { date?: Date; direction?: Direction; }) => Promise<void>;
  cursor: Cursor;
  isLoading: boolean;
};

export default function useTrends(params: Params) {
  const { fetchArticles, cursor, isLoading } = params;
  const observerTargetRef = useRef<HTMLDivElement>(null);

    const date = new Date();

  // INFO: 初回読み込み時に今日の日付で記事を取得
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchArticles({date});
  });

  // INFO: IntersectionObserverを使ってスクロールで記事を自動読み込み
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoading && cursor.next) {
          // INFO: 自動読み込みなので結果を待つ必要がないためあえてawaitしない
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          fetchArticles({ direction: 'next' });
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
    date,
    observerTargetRef,
  }
}
