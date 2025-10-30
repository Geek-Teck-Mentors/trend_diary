import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { useIsMobile } from '@/application/web/components/ui/hooks/use-mobile'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import getApiClientForClient from '../../infrastructure/api'

const formatDate = (rawDate: Date) => {
  const year = rawDate.getFullYear()
  const month = String(rawDate.getMonth() + 1).padStart(2, '0')
  const day = String(rawDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export type MediaType = 'qiita' | 'zenn' | null

export type FetchArticles = (params: {
  date: Date
  page?: number
  limit?: number
  media?: MediaType
}) => Promise<void>

export default function useTrends() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useIsMobile()

  const date = useMemo(() => new Date(), [])

  interface ArticlesResponse {
    data: Array<{
      articleId: string | number | bigint
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

  const { trigger } = useSWRMutation(
      'articles/fetch',
      async (_key: string, { arg }: { arg: { date: Date; page?: number; limit?: number; media?: MediaType } }) => {
        const queryDate = formatDate(arg.date)
        const res = await getApiClientForClient().articles.$get({
          query: {
            to: queryDate,
            from: queryDate,
            page: arg.page ?? 1,
            limit: arg.limit ?? 20,
            ...(arg.media && { media: arg.media }),
          },
        })
        if (res.status === 200) {
          return await res.json()
        }
        if (res.status >= 400 && res.status < 500) throw new Error('不正なパラメータです')
        if (res.status >= 500) throw new Error('不明なエラーが発生しました')
      },
      )

  const isLoadingRef = useRef(false)

  const fetchArticles: FetchArticles = useCallback(
    async ({ date, page = 1, limit = 20, media = null }) => {
      if (isLoadingRef.current) return
      isLoadingRef.current = true
      setIsLoading(true)
      try {
        const resJson = (await trigger({ date, page, limit, media })) as ArticlesResponse | undefined
        if (!resJson) return
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
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || 'エラーが発生しました')
        } else {
          toast.error('不明なエラーが発生しました')
        }
      } finally {
        isLoadingRef.current = false
        setIsLoading(false)
      }
    },
    [trigger],
  )

  const selectedMedia = useMemo<MediaType>(() => {
    const mediaParam = searchParams.get('media')
    return mediaParam === 'qiita' || mediaParam === 'zenn' ? mediaParam : null
  }, [searchParams])

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

    fetchArticles({ date, page: validPage, limit: validLimit, media: selectedMedia })
    // NOTE: isMobileを依存配列から除外することで、初回マウント時のisMobile変化による2重実行を防ぐ
    // isMobileの最新値はクロージャー経由で常に参照できる
  }, [searchParams, date, fetchArticles, selectedMedia])

  const handleMediaChange = useCallback(
    (media: MediaType) => {
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

  return {
    date,
    articles,
    fetchArticles,
    page,
    limit,
    totalPages,
    isLoading,
    setSearchParams,
    handleMediaChange,
    selectedMedia,
  }
}
