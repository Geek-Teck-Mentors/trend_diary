import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import useSWR from 'swr'
import { useIsMobile } from '@/application/web/components/shadcn/hooks/use-mobile'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@/common/pagination'
import type { ArticleOutput } from '@/domain/article/schema/article-schema'
import getApiClientForClient from '../../../infrastructure/api'
import { MediaType } from '../components/media-filter'

// isRead を含む記事型（フロントエンドではarticleIdをstringに統一）
export type Article = Omit<ArticleOutput, 'articleId'> & {
  articleId: string
  isRead?: boolean
}

export type Media = 'qiita' | 'zenn'

type Params = {
  page: number
  limit: number
  media: MediaType | null
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

export type FetchArticles = (params: {
  date: Date
  page?: number
  limit?: number
  media?: MediaType
}) => Promise<void>

export default function useTrends() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [totalPages, setTotalPages] = useState(DEFAULT_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const isLoadingRef = useRef(false)
  const isMobile = useIsMobile()

  const date = useMemo(() => new Date(), [])
  const formattedDate = formatDate(date)

  const params: Params = useMemo(() => {
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    const mediaParam = searchParams.get('media')

    const currentPage = pageParam ? parseInt(pageParam, 10) : 1
    const validPage = Number.isNaN(currentPage) ? 1 : Math.max(currentPage, 1)

    let validLimit: number
    if (limitParam) {
      const currentLimit = parseInt(limitParam, 10)
      validLimit = Number.isNaN(currentLimit) ? 20 : Math.max(Math.min(currentLimit, 100), 1)
    } else {
      validLimit = isMobile ? 10 : 20
    }

    return {
      page: validPage,
      limit: validLimit,
      media: mediaParam === 'qiita' || mediaParam === 'zenn' ? mediaParam : null,
    }
  }, [searchParams, isMobile])

  const cacheKey = [
    'api/articles',
    {
      to: formattedDate,
      from: formattedDate,
      page: params.page,
      limit: params.limit,
      ...(params.media && { media: params.media }),
    },
  ]

  // useSWRを使う
  const { data, isLoading, mutate } = useSWR<ArticlesResponse>(
    cacheKey,
    async () => {
      const res = await getApiClientForClient().articles.$get(
        {
          query: {
            to: formattedDate,
            from: formattedDate,
            page: params.page,
            limit: params.limit,
            ...(params.media && { media: params.media }),
          },
        },
        { init: { credentials: 'include' } },
      )
      if (res.status === 200) {
        const resJson = await res.json()
        return {
          ...resJson,
          data: resJson.data.map((_data) => ({
            ..._data,
            createdAt: new Date(_data.createdAt),
          })),
        }
      }
      // 400番台
      if (res.status >= 400 && res.status < 500) {
        throw new Error('不正なパラメータです')
      }

      throw new Error('不明なエラーが発生しました')
    },
    {
      onError: (error) => {
        if (error instanceof Error) {
          const errorMessage = error.message || 'エラーが発生しました'
          toast.error(errorMessage)
        } else {
          toast.error('不明なエラーが発生しました')
          // biome-ignore lint/suspicious/noConsole: 未知のエラーのため
          console.error(error)
        }
      },
    },
  )

  const handleMediaChange = useCallback(
    (media: MediaType | null) => {
      const newParams = new URLSearchParams(searchParams)
      if (media) {
        newParams.set('media', media)
      } else {
        newParams.delete('media')
      }
      // メディアを変更したらページを1にリセット
      newParams.delete('page')
      setSearchParams(newParams)
    },
    [searchParams, setSearchParams],
  )

  const updateArticleReadStatus = useCallback(
    (articleId: string, isRead: boolean) => {
      if (!data) return
      const updatedArticles = data.data.map((article) =>
        article.articleId === articleId ? { ...article, isRead } : article,
      )
      mutate({ ...data, data: updatedArticles }, { revalidate: false })
    },
    [data, mutate],
  )

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
