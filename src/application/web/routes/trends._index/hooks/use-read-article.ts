import { isFailure, wrapAsyncCall } from '@yuukihayashi0510/core'
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

    const result = await wrapAsyncCall(async () => {
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
    })

    isLoadingRef.current = false
    setIsLoading(false)

    if (isFailure(result)) {
      // biome-ignore lint/suspicious/noConsole: デバッグのためにエラーログを出力
      console.error('Failed to mark as read:', result.error)
      toast.error(MarkAsReadErrorMessage)
      return false
    }

    return true
  }, [])

  const markAsUnread = useCallback(async (articleId: string): Promise<boolean> => {
    if (isLoadingRef.current) return false

    isLoadingRef.current = true
    setIsLoading(true)

    const result = await wrapAsyncCall(async () => {
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
    })

    isLoadingRef.current = false
    setIsLoading(false)

    if (isFailure(result)) {
      // biome-ignore lint/suspicious/noConsole: デバッグのためにエラーログを出力
      console.error('Failed to mark as unread:', result.error)
      toast.error(MarkAsUnreadErrorMessage)
      return false
    }

    return true
  }, [])

  return {
    markAsRead,
    markAsUnread,
    isLoading,
  }
}
