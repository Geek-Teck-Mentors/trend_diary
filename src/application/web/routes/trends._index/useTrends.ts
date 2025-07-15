import { useCallback, useEffect, useMemo } from 'react'
import { PaginationCursor, PaginationDirection } from '../../types/paginations'

type Params = {
  fetchArticles: (params: {
    date?: Date
    direction?: PaginationDirection
    limit?: number
  }) => Promise<void>
  cursor: PaginationCursor
}

export default function useTrends(params: Params) {
  const { fetchArticles, cursor } = params

  const date = new Date();

  // INFO: 初回読み込み時に今日の日付で記事を取得
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchArticles({ date })
  }, [])

  const handleNextPage = useCallback(async () => {
    if (cursor.next) {
      await fetchArticles({ date, direction: 'next' })
    }
  }, [fetchArticles, cursor.next, date])

  const handlePrevPage = useCallback(async () => {
    if (cursor.prev) {
      await fetchArticles({ date, direction: 'prev' })
    }
  }, [fetchArticles, cursor.prev, date])

  return {
    date,
    handleNextPage,
    handlePrevPage,
  }
}
