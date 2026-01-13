import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import useSWR from 'swr'
import { useIsMobile } from '@/application/web/components/shadcn/hooks/use-mobile'
import createSWRFetcher from '@/application/web/features/create-swr-fetcher'
import { offsetPaginationMobileSchema, offsetPaginationSchema } from '@/common/pagination/schema'
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

export default function useArticles() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isMobile = useIsMobile()
  const { client, apiCall } = createSWRFetcher()

  const date = new Date()
  const formattedDate = formatDate(date)

  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const mediaParam = searchParams.get('media')

  // INFO: schemaはnullではなくundefinedを許容するため、nullの場合はundefinedに変換する
  const { page: validPage, limit: validLimit } = (
    isMobile ? offsetPaginationMobileSchema : offsetPaginationSchema
  ).parse({ page: pageParam ?? undefined, limit: limitParam ?? undefined })

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

  const { data, isLoading, mutate } = useSWR<ArticlesResponse>(
    'api/articles',
    async () => {
      const result = await apiCall<ArticlesResponse>(() =>
        client.articles.$get({ query }, { init: { credentials: 'include' } }),
      )

      if (!result) {
        throw new Error('データの取得に失敗しました')
      }

      return {
        ...result,
        data: result.data.map((article) => ({
          ...article,
          createdAt: new Date(article.createdAt),
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

  const reloadArticles = () => mutate()

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams)
    if (newPage > 1) {
      newParams.set('page', newPage.toString())
    } else {
      newParams.delete('page')
    }

    setSearchParams(newParams)
  }

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

  // searchParamsが変更されたら再fetchする
  // INFO: 更新のタイミングでのmutateだと、古いパラメータでfetchされてしまうためuseEffect内で実行する
  useEffect(() => {
    mutate()
  }, [searchParams])

  return {
    date,
    articles: data?.data || [],
    reloadArticles,
    page: data?.page || params.page,
    limit: data?.limit || params.limit,
    totalPages: data?.totalPages || 1,
    isLoading,
    setSearchParams,
    handlePageChange,
    handleMediaChange,
    selectedMedia: params.media,
  }
}
