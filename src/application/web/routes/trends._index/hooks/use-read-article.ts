import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import getApiClientForClient from '../../../infrastructure/api'

const MarkAsReadErrorMessage = '既読に失敗しました'
const MarkAsUnreadErrorMessage = '未読に失敗しました'

export default function useReadArticle() {
  const [isLoading, setIsLoading] = useState(false)
  const isLoadingRef = useRef(false)

  const markAsRead = useCallback(async (articleId: string): Promise<boolean> => {
    if (isLoadingRef.current) return false

    isLoadingRef.current = true
    setIsLoading(true)

    try {
      const client = getApiClientForClient()
      // biome-ignore lint/suspicious/noExplicitAny: Hono client の型定義が param と json の同時指定に対応していない
      const res = await (client.articles[':article_id'].read.$post as any)(
        {
          param: { article_id: articleId },
          json: { read_at: new Date().toISOString() },
        },
        { init: { credentials: 'include' } },
      )

      if (res.status !== 201) {
        throw new Error('Failed to mark as read')
      }
      return true
    } catch {
      toast.error(MarkAsReadErrorMessage)
      return false
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [])

  const markAsUnread = useCallback(async (articleId: string): Promise<boolean> => {
    if (isLoadingRef.current) return false

    isLoadingRef.current = true
    setIsLoading(true)

    try {
      const client = getApiClientForClient()
      const res = await client.articles[':article_id'].unread.$delete(
        {
          param: { article_id: articleId },
        },
        { init: { credentials: 'include' } },
      )

      if (res.status !== 200) {
        throw new Error('Failed to mark as unread')
      }
      return true
    } catch {
      toast.error(MarkAsUnreadErrorMessage)
      return false
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [])

  return {
    markAsRead,
    markAsUnread,
    isLoading,
  }
}
