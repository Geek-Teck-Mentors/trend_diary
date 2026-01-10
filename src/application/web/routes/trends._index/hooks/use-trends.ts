import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import useSWR from 'swr'
import { useIsMobile } from '@/application/web/components/shadcn/hooks/use-mobile'
import createSWRFetcher from '@/application/web/features/create-swr-fetcher'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@/common/pagination'
import { DEFAULT_MOBILE_LIMIT } from '@/common/pagination/schema'
import type { ArticleOutput } from '@/domain/article/schema/article-schema'
import { MediaType } from '../components/media-filter'

// isRead を含む記事型(フロントエンドではarticleIdをstringに統一)
export type Article = Omit<ArticleOutput, 'articleId'> & {
  articleId: string
  isRead?: boolean
}

type Params = {
  page: number
  limit: number
  media: MediaType
}

type ArticlesResponse = {
  data: Article[]
  page: number
  limit: number
  totalPages: number
}

const formatDate = (rawDate: Date) => {
  const year = rawDate.getFullYear()
  const month = String(rawDate.getMonth() + 1).padStart(2, '0')
  const day = String(rawDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function useTrends() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isMobile = useIsMobile()
  const { client, apiCall } = createSWRFetcher()

  const date = new Date()
  const formattedDate = formatDate(date)

  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const mediaParam = searchParams.get('media')

  const currentPage = pageParam ? parseInt(pageParam, 10) : DEFAULT_PAGE
  const validPage = Number.isNaN(currentPage) ? DEFAULT_PAGE : Math.max(currentPage, 1)

  // limitParamが明示的に指定されている場合はそれを使用
  // 指定がない場合のみisMobileに基づいたデフォルト値を使用
  let validLimit: number
  if (limitParam) {
    const currentLimit = parseInt(limitParam, 10)
    validLimit = Number.isNaN(currentLimit)
      ? DEFAULT_LIMIT
      : Math.max(Math.min(currentLimit, 100), 1)
  } else {
    validLimit = isMobile ? DEFAULT_MOBILE_LIMIT : DEFAULT_LIMIT
  }

  const params: Params = {
    page: validPage,
    limit: validLimit,
    media: mediaParam === 'qiita' || mediaParam === 'zenn' ? mediaParam : null,
  }

  const query = {
    to: formattedDate,
    from: formattedDate,
    page: params.page,
    limit: params.limit,
    ...(params.media && { media: params.media }),
  }

  const cacheKey = ['articles', query]

  const { data, isLoading, mutate } = useSWR<ArticlesResponse>(
    cacheKey,
    async () => {
      const result = await apiCall<ArticlesResponse>(() =>
        client.articles.$get({ query }, { init: { credentials: 'include' } }),
      )

      if (!result) {
        throw new Error('データの取得に失敗しました')
      }

      return {
        ...result,
        data: result.data.map((_data) => ({
          ..._data,
          createdAt: new Date(_data.createdAt),
        })),
      }
    },
    {
      onError: (error) => {
        if (error instanceof Error) {
          toast.error('エラーが発生しました。時間をおいて再度お試しください。')
        } else {
          toast.error('不明なエラーが発生しました')
          // biome-ignore lint/suspicious/noConsole: 未知のエラーのため
          console.error(error)
        }
      },
    },
  )

  const handleMediaChange = (media: MediaType) => {
    const newParams = new URLSearchParams(searchParams)
    if (media) {
      newParams.set('media', media)
    } else {
      newParams.delete('media')
    }
    // メディアを変更したらページを1にリセット
    newParams.delete('page')
    setSearchParams(newParams)
  }

  const updateArticleReadStatus = (articleId: string, isRead: boolean) => {
    if (!data) return
    const updatedArticles = data.data.map((article) =>
      article.articleId === articleId ? { ...article, isRead } : article,
    )
    mutate({ ...data, data: updatedArticles }, { revalidate: false })
  }

  return {
    date,
    articles: data?.data || [],
    page: data?.page || params.page,
    limit: data?.limit || params.limit,
    totalPages: data?.totalPages || 1,
    isLoading,
    setSearchParams,
    handleMediaChange,
    selectedMedia: params.media,
    updateArticleReadStatus,
  }
}
