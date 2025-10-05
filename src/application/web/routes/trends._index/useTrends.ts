import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
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
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const date = new Date()

  const fetchArticles: FetchArticles = useCallback(
    async ({ date, page = 1, limit = 20 }) => {
      if (isLoading) return

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
          setTotalPages(resJson.totalPages)

          // URLパラメータを更新（無限ループ防止のため、既に同じ値の場合は更新しない）
          const currentPage = searchParams.get('page')
          const shouldUpdateUrl = page > 1 ? currentPage !== page.toString() : currentPage !== null

          if (shouldUpdateUrl) {
            const newParams = new URLSearchParams(searchParams)
            if (page > 1) {
              newParams.set('page', page.toString())
            } else {
              newParams.delete('page')
            }
            setSearchParams(newParams, { replace: true })
          }

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
        setIsLoading(false)
      }
    },
    [isLoading, searchParams, setSearchParams],
  )

  // INFO: 初回読み込み時に今日の日付で記事を取得（URLパラメータからページ番号を取得）
  useEffect(() => {
    const pageParam = searchParams.get('page')
    const initialPage = pageParam ? parseInt(pageParam, 10) : 1
    const validPage = Number.isNaN(initialPage) ? 1 : Math.max(initialPage, 1)
    fetchArticles({ date, page: validPage })
  }, [])

  return {
    date,
    articles,
    fetchArticles,
    page,
    totalPages,
    isLoading,
  }
}
