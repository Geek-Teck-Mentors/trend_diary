import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import getApiClientForClient from '../../infrastructure/api'
import { PaginationCursor, PaginationDirection } from '../../types/paginations'

const formatDate = (rawDate: Date) => {
  const year = rawDate.getFullYear()
  const month = String(rawDate.getMonth() + 1).padStart(2, '0')
  const day = String(rawDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export type FetchArticles = (params: {
  date: Date
  direction?: PaginationDirection
  limit?: number
}) => Promise<void>

export default function useTrends() {
  const [articles, setArticles] = useState<Article[]>([])
  const [cursor, setCursor] = useState<PaginationCursor>({})
  const [isLoading, setIsLoading] = useState(false)

  const date = new Date()

  const fetchArticles: FetchArticles = useCallback(
    async ({ date, direction = 'next', limit = 20 }) => {
      if (isLoading) return

      setIsLoading(true)
      try {
        const queryDate = formatDate(date)

        const res = await getApiClientForClient().articles.$get({
          query: {
            to: queryDate,
            from: queryDate,
            direction,
            cursor: cursor[direction],
            limit,
          },
        })
        if (res.status === 200) {
          const resJson = await res.json()
          setArticles(
            resJson.data.map((data) => ({
              articleId: BigInt(data.articleId),
              media: data.media,
              title: data.title,
              author: data.author,
              description: data.description,
              url: data.url,
              createdAt: new Date(data.createdAt),
            })),
          )
          setCursor({
            next: resJson.nextCursor,
            prev: resJson.prevCursor,
          })
          // 400番台
        } else if (res.status >= 400 && res.status < 500) {
          throw new Error('不正なパラメータです')
        } else if (res.status >= 500) {
          throw new Error('不明なエラーが発生しました')
        }
      } catch (error) {
        if (error instanceof Error) {
          const errorMessage = error.message || 'エラーが発生しました'
          toast.error(errorMessage)
        } else {
          toast.error('不明なエラーが発生しました')
          // biome-ignore lint/suspicious/noConsole: 未知のエラーのため
          console.error(error)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [cursor, isLoading],
  )

  // INFO: 初回読み込み時に今日の日付で記事を取得
  useEffect(() => {
    fetchArticles({ date })
  }, [])

  return {
    date,
    articles,
    fetchArticles,
    cursor,
    isLoading,
  }
}
