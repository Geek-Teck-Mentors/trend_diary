import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useIsMobile } from '@/application/web/components/ui/hooks/use-mobile'
import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
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

export type FetchArticles = (params: {
  date: Date
  direction?: PaginationDirection
  limit?: number
}) => Promise<void>

export default function useTrends() {
  const { client, apiCall } = createSWRFetcher()
  const [cursor, setCursor] = useState<PaginationCursor>({})
  const [currentQueryDate, setCurrentQueryDate] = useState<string>(formatDate(new Date()))

  const date = new Date() // 常に今日の日付を返す

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
        const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました'
        toast.error(errorMessage)
      },
      onSuccess: (data) => {
        // SWRの自動機能でカーソルを管理
        setCursor({
          next: data.nextCursor,
          prev: data.prevCursor,
        })
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

  // pagination用のfetchArticles（SWRの自動機能を活用）
  const { trigger: fetchArticlesMutation, isMutating } = useSWRMutation(
    'articles/pagination',
    async (
      key,
      { arg }: { arg: { date: Date; direction: PaginationDirection; limit: number } },
    ) => {
      const queryDate = formatDate(arg.date)
      const response = await apiCall(() =>
        client.articles.$get({
          query: {
            to: queryDate,
            from: queryDate,
            direction: arg.direction,
            cursor: cursor[arg.direction],
            limit: arg.limit,
          },
        }),
      )

      // 成功時の処理をここで実行
      setCurrentQueryDate(queryDate)
      // SWRの自動再検証を活用
      mutate(`articles/${queryDate}`)

      return response
    },
    {
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました'
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
          limit,
        })
      } catch (_error) {
        // エラーは既にuseSWRMutationで処理されている
      }
    },
    [fetchArticlesMutation, isLoading, isMutating],
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
    date, // 常に今日の日付（元の要件通り）
    articles,
    fetchArticles,
    cursor,
    isLoading: isLoading || isMutating,
  }
}
