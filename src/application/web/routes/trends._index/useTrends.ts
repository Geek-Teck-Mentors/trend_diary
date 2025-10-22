import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { useIsMobile } from '@/application/web/components/ui/hooks/use-mobile'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import getApiClientForClient from '../../infrastructure/api'

const formatDate = (rawDate: Date) => {
  const year = rawDate.getFullYear()
  const month = String(rawDate.getMonth() + 1).padStart(2, '0')
  const day = String(rawDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export type FetchArticles = (params: { date: Date; page?: number; limit?: number }) => Promise<void>

export default function useTrends() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const isLoadingRef = useRef(false)
  const isMobile = useIsMobile()

  const date = useMemo(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      const parsedDate = new Date(dateParam)
      return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate
    }
    return new Date()
  }, [searchParams])

  const fetchArticles: FetchArticles = useCallback(async ({ date, page = 1, limit = 20 }) => {
    if (isLoadingRef.current) return

    isLoadingRef.current = true
    setIsLoading(true)
    try {
      const queryDate = formatDate(date)

      const res = await getApiClientForClient().articles.$get({
        query: {
          to: queryDate,
          from: queryDate,
          page,
          limit,
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
      } else {
        toast.error('不明なエラーが発生しました')
        // biome-ignore lint/suspicious/noConsole: 未知のエラーのため
        console.error(error)
      }
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [])

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
