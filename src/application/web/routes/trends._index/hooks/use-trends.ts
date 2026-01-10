import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import useSWR from 'swr'
import { useIsMobile } from '@/application/web/components/shadcn/hooks/use-mobile'
import createSWRFetcher from '@/application/web/features/create-swr-fetcher'
import {
  createOffsetPaginationSchema,
  DEFAULT_LIMIT,
  DEFAULT_MOBILE_LIMIT,
} from '@/common/pagination/schema'
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

  const mediaParam = searchParams.get('media')

  // モバイル判定に基づいたデフォルト値でschemaを生成
  const defaultLimit = isMobile ? DEFAULT_MOBILE_LIMIT : DEFAULT_LIMIT
  const paginationSchema = createOffsetPaginationSchema(defaultLimit)

  // URLパラメータをschemaでバリデーション
  // searchParams.get()はnullを返すので、undefinedに変換
  const { page: validPage, limit: validLimit } = paginationSchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

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
    mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ...currentData,
          data: currentData.data.map((article) =>
            article.articleId === articleId ? { ...article, isRead } : article,
          ),
        }
      },
      { revalidate: false },
    )
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
