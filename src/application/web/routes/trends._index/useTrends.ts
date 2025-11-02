import { useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import useSWR, { type KeyedMutator } from 'swr'
import { useIsMobile } from '@/application/web/components/ui/hooks/use-mobile'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import getApiClientForClient from '../../infrastructure/api'

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export type MediaType = 'qiita' | 'zenn' | null

export interface UseTrendsResult {
  date: Date
  articles: Article[]
  error: Error | undefined
  isLoading: boolean
  page: number
  limit: number
  totalPages: number
  setSearchParams: ReturnType<typeof useSearchParams>[1]
  handleMediaChange: (media: MediaType) => void
  selectedMedia: MediaType
  mutate: KeyedMutator<ArticlesResponse>
}

// APIレスポンスの生データ型 (SWRキャッシュ格納用)
interface RawArticle {
  articleId: string | number | bigint
  media: string
  title: string
  author: string
  description: string
  url: string
  createdAt: string | Date
}

interface ArticlesResponse {
  articles: RawArticle[]
  page: number
  limit: number
  totalPages: number
}

export default function useTrends() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isMobile = useIsMobile()
  // 初期化日付は不変
  const dateRef = useRef(new Date())
  const date = dateRef.current

  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const mediaParam = searchParams.get('media')

  const page = (() => {
    const p = pageParam ? parseInt(pageParam, 10) : 1
    return !p || Number.isNaN(p) || p < 1 ? 1 : p
  })()
  const limit = (() => {
    if (!limitParam) return isMobile ? 10 : 20
    const l = parseInt(limitParam, 10)
    if (Number.isNaN(l)) return 20
    return Math.max(Math.min(l, 100), 1)
  })()
  const selectedMedia: MediaType =
    mediaParam === 'qiita' || mediaParam === 'zenn' ? mediaParam : null

  // SWR fetcher
  const fetcher = useCallback(
    async (
      _key: string,
      day: string,
      currentPage: number,
      currentLimit: number,
      currentMedia: MediaType | '',
    ) => {
      // 400-499: 不正パラメータ / 500+: サーバー内部エラー / その他: 未知ステータス。
      const res = await getApiClientForClient().articles.$get({
        query: {
          to: day,
          from: day,
          page: currentPage,
          limit: currentLimit,
          ...(currentMedia && { media: currentMedia }),
        },
      })
      if (res.status === 200) {
        const raw = await res.json()
        const list = (raw as any).articles ? (raw as any).articles : raw.data
        return {
          articles: list,
          page: raw.page,
          limit: raw.limit,
          totalPages: raw.totalPages,
        }
      }
      if (res.status >= 400 && res.status < 500) throw new Error('不正なパラメータです')
      if (res.status >= 500) throw new Error('不明なエラーが発生しました')
      throw new Error(`予期せぬレスポンスステータスです: ${res.status}`)
    },
    [],
  )

  const day = formatDate(date)
  const mediaKey = selectedMedia ?? ''
  const swrKey = ['articles/fetch', day, page, limit, mediaKey] as const

  const { data, error, isLoading, mutate } = useSWR<ArticlesResponse, Error>(
    swrKey,
    (args: readonly [string, string, number, number, string | MediaType]) =>
      fetcher(args[0], args[1], args[2], args[3], args[4] as MediaType | ''),
    {
      // [Error Handling 2] fetcher で投げられた Error を受け取り UI へ通知。
      onError: (e) => toast.error(e.message || 'エラーが発生しました'),
    },
  )

  const articles: Article[] = (data?.articles ?? []).map((a: RawArticle) => ({
    articleId: BigInt(a.articleId),
    media: a.media as Article['media'],
    title: a.title,
    author: a.author,
    description: a.description,
    url: a.url,
    createdAt: new Date(a.createdAt),
  }))

  const totalPages = data?.totalPages ?? 1

  const handleMediaChange = useCallback(
    (media: MediaType) => {
      const newParams = new URLSearchParams(searchParams)
      media ? newParams.set('media', media) : newParams.delete('media')
      newParams.delete('page')
      setSearchParams(newParams)
    },
    [searchParams, setSearchParams],
  )

  return {
    date,
    articles,
    error,
    isLoading: isLoading,
    page,
    limit,
    totalPages,
    setSearchParams,
    handleMediaChange,
    selectedMedia,
    mutate,
  } as UseTrendsResult
}
