import { useEffect, useMemo } from 'react';
import { PaginationDirection } from '../../types/paginations';

type Params = {
  fetchArticles: (params: {
    date?: Date;
    direction?: PaginationDirection;
    limit?: number;
  }) => Promise<void>;
};

export default function useTrends(params: Params) {
  const { fetchArticles } = params;

  const date = useMemo(() => new Date(), []);

  // INFO: 初回読み込み時に今日の日付で記事を取得
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchArticles({ date });
  }, []);

  return {
    date,
  };
}
