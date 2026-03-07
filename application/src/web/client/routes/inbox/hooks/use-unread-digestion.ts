import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import type { ArticleOutput } from '@/domain/article/schema/article-schema'
import createSWRFetcher from '@/web/client/features/create-swr-fetcher'
import type { MediaType } from '../../trends._index/components/media-filter'
import useReadArticle from '../../trends._index/hooks/use-read-article'

export type Article = Omit<ArticleOutput, 'articleId'> & {
  articleId: string
}

type UnreadDigestionResponse = {
  data: Article[]
}

const SkipErrorMessage = 'スキップに失敗しました'

export default function useUnreadDigestion(enabled: boolean, selectedMedia: MediaType) {
  const { client, apiCall } = createSWRFetcher()
  const { markAsRead } = useReadArticle()
  const [queue, setQueue] = useState<Article[]>([])
  const [isActionLoading, setIsActionLoading] = useState(false)

  const swrKey = enabled ? ['api/articles/unread-digestion', selectedMedia] : null
  const { data, isLoading } = useSWR<UnreadDigestionResponse>(swrKey, async () => {
    const query = selectedMedia ? { media: selectedMedia } : {}
    const result = await apiCall<UnreadDigestionResponse>(() =>
      client.articles['unread-digestion'].$get({ query }, { init: { credentials: 'include' } }),
    )

    if (!result) {
      throw new Error('未読消化データの取得に失敗しました')
    }

    return {
      data: result.data.map((article) => ({
        ...article,
        createdAt: new Date(article.createdAt),
      })),
    }
  })

  useEffect(() => {
    setQueue(data?.data ?? [])
  }, [data])

  const currentArticle = queue[0] ?? null

  const handleSkip = useCallback(async () => {
    if (!currentArticle) return
    setIsActionLoading(true)

    try {
      const res = await client.articles[':article_id'].skip.$post(
        {
          param: { article_id: currentArticle.articleId },
        },
        { init: { credentials: 'include' } },
      )

      if (res.status !== 201) {
        throw new Error('Failed to skip article')
      }

      setQueue((prev) => prev.slice(1))
    } catch (_error) {
      toast.error(SkipErrorMessage)
    } finally {
      setIsActionLoading(false)
    }
  }, [client.articles, currentArticle])

  const handleRead = useCallback(async () => {
    if (!currentArticle) return
    setIsActionLoading(true)

    try {
      window.open(currentArticle.url, '_blank', 'noopener,noreferrer')
      await markAsRead(currentArticle.articleId)
      setQueue((prev) => prev.slice(1))
    } finally {
      setIsActionLoading(false)
    }
  }, [currentArticle, markAsRead])

  const handleLater = useCallback(() => {
    setQueue((prev) => {
      if (prev.length <= 1) return prev
      const [head, ...rest] = prev
      return [...rest, head]
    })
  }, [])

  return {
    isLoading: isLoading || isActionLoading,
    currentArticle,
    remainingCount: queue.length,
    handleSkip,
    handleRead,
    handleLater,
  }
}
