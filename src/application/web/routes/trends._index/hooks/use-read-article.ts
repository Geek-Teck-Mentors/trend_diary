import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import getApiClientForClient from '../../../infrastructure/api'

type UseReadArticleReturn = {
  markAsRead: (articleId: bigint) => Promise<void>
  markAsUnread: (articleId: bigint) => Promise<void>
  isLoading: boolean
}

export default function useReadArticle(): UseReadArticleReturn {
  const [isLoading, setIsLoading] = useState(false)

  const markAsRead = useCallback(async (articleId: bigint) => {
    setIsLoading(true)
    try {
      const client = getApiClientForClient()
      const res = await client.articles[':article_id'].read.$post({
        param: { article_id: articleId.toString() },
        json: { read_at: new Date().toISOString() },
      })

      if (res.status === 201) {
        const resJson = await res.json()
        toast.success(resJson.message)
      } else if (res.status >= 400 && res.status < 500) {
        throw new Error('既読登録に失敗しました')
      } else if (res.status >= 500) {
        throw new Error('サーバーエラーが発生しました')
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('不明なエラーが発生しました')
        // biome-ignore lint/suspicious/noConsole: 未知のエラーのため
        console.error(error)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsUnread = useCallback(async (articleId: bigint) => {
    setIsLoading(true)
    try {
      const client = getApiClientForClient()
      const res = await client.articles[':article_id'].unread.$delete({
        param: { article_id: articleId.toString() },
      })

      if (res.status === 200) {
        const resJson = await res.json()
        toast.success(resJson.message)
      } else if (res.status >= 400 && res.status < 500) {
        throw new Error('未読登録に失敗しました')
      } else if (res.status >= 500) {
        throw new Error('サーバーエラーが発生しました')
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('不明なエラーが発生しました')
        // biome-ignore lint/suspicious/noConsole: 未知のエラーのため
        console.error(error)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    markAsRead,
    markAsUnread,
    isLoading,
  }
}
