import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useIsMobile } from '@/application/web/components/ui/hooks/use-mobile'
import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
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
  const [isLoading, setIsLoading] = useState(true) // 初期値をtrueに設定

  const date = new Date()

  // SWRで初期データ取得
  const { data: swrData, error: swrError } = useSWR(`articles-${formatDate(date)}`, async () => {
    const res = await getApiClientForClient().articles.$get({
      query: {
        to: formatDate(date),
        from: formatDate(date),
        direction: 'next',
        cursor: undefined,
        limit: 20,
      },
    })

    if (res.status === 200) {
      const resJson = await res.json()
      return {
        articles: resJson.data.map((data) => ({
          articleId: BigInt(data.articleId),
          media: data.media,
          title: data.title,
          author: data.author,
          description: data.description,
          url: data.url,
          createdAt: new Date(data.createdAt),
        })),
        cursor: {
          next: resJson.nextCursor ,
          prev: resJson.prevCursor ,
        },
      }
    }
    if (res.status >= 400 && res.status < 500) {
      throw new Error('不正なパラメータです')
    }
    if (res.status >= 500) {
      throw new Error('不明なエラーが発生しました')
    }
    throw new Error('エラーが発生しました')
  })

  // SWRのデータをstateに反映
  useEffect(() => {
    if (swrData) {
      setArticles(swrData.articles)
      setCursor(swrData.cursor)
      setIsLoading(false)
    }
  }, [swrData])

  // SWRのエラーをtoastに表示
  useEffect(() => {
    if (swrError) {
      if (swrError instanceof Error) {
        const errorMessage = swrError.message || 'エラーが発生しました'
        toast.error(errorMessage)
      } else {
        toast.error('不明なエラーが発生しました')
      }
      setIsLoading(false)
    }
  }, [swrError])

  const fetchArticles: FetchArticles = useCallback(
    async ({ date, direction, limit }) => {
      if (isLoading) return

      setIsLoading(true)
      try {
        const queryDate = formatDate(date)

        const res = await getApiClientForClient().articles.$get({
          query: {
            to: queryDate,
            from: queryDate,
            direction: direction || 'next',
            cursor: cursor[direction || 'next'] || undefined,
            limit: limit || 20,
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
        }
        if (res.status >= 400 && res.status < 500) {
          throw new Error('不正なパラメータです')
        }
        if (res.status >= 500) {
          throw new Error('不明なエラーが発生しました')
        }
      } catch (error) {
        if (error instanceof Error) {
          const errorMessage = error.message || 'エラーが発生しました'
          toast.error(errorMessage)
        } else {
          toast.error('不明なエラーが発生しました')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [cursor, isLoading],
  )

  // INFO: URLパラメータの変更を監視して記事を取得
  useEffect(() => {
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    const currentPage = pageParam ? parseInt(pageParam, 10) : 1
    const validPage = Number.isNaN(currentPage) ? 1 : Math.max(currentPage, 1)

    // limitParamが明示的に指定されている場合はそれを使用
    // 指定がない場合のみisMobileに基づいたデフォルト値を使用
    let validLimit: number
    if (limitParam) {
      const currentLimit = parseInt(limitParam, 10)
      validLimit = Number.isNaN(currentLimit) ? 20 : Math.max(Math.min(currentLimit, 100), 1)
    } else {
      // デフォルトのlimitはモバイルなら10、デスクトップなら20
      validLimit = isMobile ? 10 : 20
    }

    fetchArticles({ date, page: validPage, limit: validLimit })
    // NOTE: isMobileを依存配列から除外することで、初回マウント時のisMobile変化による2重実行を防ぐ
    // isMobileの最新値はクロージャー経由で常に参照できる
  }, [searchParams, date, fetchArticles])

  return {
    date,
    articles,
    fetchArticles,
    cursor,
    isLoading,
  }
}
