import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useIsMobile } from '@/application/web/components/ui/hooks/use-mobile'
import useSWRMutation from 'swr/mutation'
import useSWR, { mutate as globalMutate } from 'swr'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import { createSWRFetcher } from '../../features/createSWRFetcher'
import type { PaginationCursor, PaginationDirection } from '../../types/paginations'

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
  nextCursor?: string
  prevCursor?: string
}

export interface FetchArticles {
  (params: { date: Date; direction?: PaginationDirection; limit?: number }): Promise<void>
}

export default function useTrends() {
  const { client, apiCall } = createSWRFetcher()
  const [cursor, setCursor] = useState<PaginationCursor>({})
  const [currentQueryDate, setCurrentQueryDate] = useState<string>(formatDate(new Date()))
  const date = new Date() // 常に今日の日付を返す（元の要件通り）

  const date = useMemo(() => new Date(), [])

  const fetchArticles: FetchArticles = useCallback(async ({ date, page = 1, limit = 20 }) => {
    if (isLoadingRef.current) return
  // SWRで記事データ取得（カーソル管理を自動化）
  const { data: articlesData, isLoading } = useSWR<ArticlesResponse>(
    `articles/${currentQueryDate}`,
    async (): Promise<ArticlesResponse> => {
      return apiCall(() =>
        client.articles.$get({
          query: {
            to: currentQueryDate,
            from: currentQueryDate,
            direction: 'next' as PaginationDirection,
            cursor: (cursor.next || null) as any,
            limit: 20,
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
          // HTTPエラーの場合、ステータスコードに基づいてメッセージを決定
          if (error.message.startsWith('HTTP 4')) {
            errorMessage = '不正なパラメータです'
          } else if (error.message.startsWith('HTTP 5')) {
            errorMessage = '不明なエラーが発生しました'
          } else {
            errorMessage = error.message
          }
        }
      } else if (res.status >= 400 && res.status < 500) {
        throw new Error('不正なパラメータです')
      } else if (res.status >= 500) {
        throw new Error('不明なエラーが発生しました')
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

    isLoadingRef.current = true
    setIsLoading(true)
    try {
      const queryDate = formatDate(date)

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
        }),
      )

      // 成功時の処理をここで実行
      setCurrentQueryDate(queryDate)
      // SWRの自動再検証を活用
      mutate(`articles/${queryDate}`)

      // カーソル情報を更新
      setCursor({
        next: (response as ArticlesResponse).nextCursor,
        prev: (response as ArticlesResponse).prevCursor,
      })

      return response
    },
    {
      onError: (error) => {
        let errorMessage = 'エラーが発生しました'
        
        if (error instanceof Error) {
          // HTTPエラーの場合、ステータスコードに基づいてメッセージを決定
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

  // 元のインターフェースを維持するためのラッパー関数
  const fetchArticles: FetchArticles = useCallback(
    async ({ date: targetDate, direction = 'next', limit = 20 }) => {
      if (isLoading || isMutating) return

      try {
        await fetchArticlesMutation({
          date: targetDate,
          direction,
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
        setPage(resJson.page)
        setLimit(resJson.limit)
        setTotalPages(resJson.totalPages)

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
      },
    },
  )

  // 記事データの変換（元のロジック通り）
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

  // カーソル更新（SWRデータが更新された時）
  useEffect(() => {
    if (articlesData) {
      setCursor({
        next: articlesData.nextCursor,
        prev: articlesData.prevCursor,
      })
    }
  }, [articlesData])

  // pagination用のfetchArticles（元の要件維持）
  const fetchArticles: FetchArticles = useCallback(
    async ({ date: targetDate, direction = 'next', limit = 20 }) => {
      if (isLoading) return

      try {
        const queryDate = formatDate(targetDate)

        const response = await apiCall(() =>
          client.articles.$get({
            query: {
              to: queryDate,
              from: queryDate,
              direction,
              cursor: cursor[direction],
              limit,
            },
          }),
        )

        // 新しいクエリ日付を設定（SWRキーが変わって自動で新しいデータ取得）
        setCurrentQueryDate(queryDate)

        // SWRキャッシュを更新
        globalMutate(`articles/${queryDate}`, response, false)
      } catch (_error) {
        const errorMessage = _error instanceof Error ? _error.message : 'エラーが発生しました'
        toast.error(errorMessage)
      }
    },
    [cursor, isLoading, client, apiCall],
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
    page,
    limit,
    totalPages,
    isLoading,
    setSearchParams,
  }
}
