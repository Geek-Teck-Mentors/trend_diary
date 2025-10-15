import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import useSWR, { mutate as globalMutate } from 'swr'
import { useIsMobile } from '@/application/web/components/ui/hooks/use-mobile'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import { createSWRFetcher } from '../../features/createSWRFetcher'

const formatDate = (rawDate: Date) => {
  const year = rawDate.getFullYear()
  const month = String(rawDate.getMonth() + 1).padStart(2, '0')
  const day = String(rawDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface ArticlesResponse {
  data: Array<{
    articleId: string
    media: string
    title: string
    author: string
    description: string
    url: string
    createdAt: string
  }>
  page: number
  limit: number
  totalPages: number
}

export interface FetchArticles {
  (params: { date: Date; page?: number; limit?: number }): Promise<void>
}

export default function useTrends() {
  const { client, apiCall } = createSWRFetcher()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentQueryDate, setCurrentQueryDate] = useState<string>(formatDate(new Date()))
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const isMobile = useIsMobile()

  const date = useMemo(() => new Date(), [])

  // SWRで記事データ取得
  const { data: articlesData, isLoading } = useSWR<ArticlesResponse>(
    `articles/${currentQueryDate}?page=${page}&limit=${limit}`,
    async (): Promise<ArticlesResponse> => {
      return apiCall(() =>
        client.articles.$get({
          query: {
            to: currentQueryDate,
            from: currentQueryDate,
            page,
            limit,
          },
        }),
      )
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 2,
      fallbackData: undefined,
      onError: (error) => {
        let errorMessage = 'エラーが発生しました'

        if (error instanceof Error) {
          if (error.message.startsWith('HTTP 4')) {
            errorMessage = '不正なパラメータです'
          } else if (error.message.startsWith('HTTP 5')) {
            errorMessage = '不明なエラーが発生しました'
          } else {
            errorMessage = error.message
          }
        }

        toast.error(errorMessage)
      },
    },
  )

  // 記事データの変換
  const articles: Article[] =
    articlesData?.data?.map((data) => ({
      articleId: BigInt(data.articleId),
      media: data.media,
      title: data.title,
      author: data.author,
      description: data.description,
      url: data.url,
      createdAt: new Date(data.createdAt),
    })) ?? []

  // ページネーション情報を更新（SWRデータが更新された時）
  useEffect(() => {
    if (articlesData) {
      setTotalPages(articlesData.totalPages)
    }
  }, [articlesData])

  // pagination用のfetchArticles（元の要件維持）
  const fetchArticles: FetchArticles = useCallback(
    async ({ date: targetDate, page: targetPage = 1, limit: fetchLimit = 20 }) => {
      if (isLoading) return

      try {
        const queryDate = formatDate(targetDate)

        const response = await apiCall(() =>
          client.articles.$get({
            query: {
              to: queryDate,
              from: queryDate,
              page: targetPage,
              limit: fetchLimit,
            },
          }),
        )

        // 新しいクエリ日付を設定（SWRキーが変わって自動で新しいデータ取得）
        setCurrentQueryDate(queryDate)
        setPage(targetPage)
        setLimit(fetchLimit)

        // SWRキャッシュを更新
        globalMutate(
          `articles/${queryDate}?page=${targetPage}&limit=${fetchLimit}`,
          response,
          false,
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました'
        toast.error(errorMessage)
      }
    },
    [isLoading, client, apiCall],
  )

  // URLパラメータの変更を監視して記事を取得
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

    setPage(validPage)
    setLimit(validLimit)
    fetchArticles({ date, page: validPage, limit: validLimit })
    // NOTE: isMobileを依存配列から除外することで、初回マウント時のisMobile変化による2重実行を防ぐ
    // isMobileの最新値はクロージャー経由で常に参照できる
  }, [searchParams, date, fetchArticles])

  return {
    date,
    articles,
    fetchArticles,
    page,
    limit,
    totalPages,
    isLoading,
    setSearchParams,
  }
}
