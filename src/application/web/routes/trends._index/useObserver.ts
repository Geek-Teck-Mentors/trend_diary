import { useEffect, useRef } from 'react';
import { PaginationCursor, PaginationDirection } from '../../types/paginations';

type Params = {
  fetchArticles: (params: { date?: Date; direction?: PaginationDirection }) => Promise<void>;
  cursor: PaginationCursor;
  isLoading: boolean;
};
export default function useObserver(params: Params) {
  const { fetchArticles, cursor, isLoading } = params;
  const observerTargetRef = useRef<HTMLDivElement>(null);

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
    observerTargetRef,
  };
}
