import { useCallback, useState } from 'react'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import getApiClientForClient from '../../../infrastructure/api'

type UseReadArticleReturn = {
  markAsRead: (articleId: bigint) => AsyncResult<string, Error>
  markAsUnread: (articleId: bigint) => AsyncResult<string, Error>
  isLoading: boolean
}

export default function useReadArticle(): UseReadArticleReturn {
  const [isLoading, setIsLoading] = useState(false)

  const markAsRead = useCallback(async (articleId: bigint): AsyncResult<string, Error> => {
    setIsLoading(true)
    try {
      const client = getApiClientForClient()
      const res = await client.articles[':article_id'].read.$post({
        param: { article_id: articleId.toString() },
        json: { read_at: new Date().toISOString() },
      })

      if (res.status === 201) {
        const resJson = await res.json()
        return success(resJson.message)
      }
      if (res.status >= 400 && res.status < 500) {
        return failure(new Error('既読登録に失敗しました'))
      }
      if (res.status >= 500) {
        return failure(new Error('サーバーエラーが発生しました'))
      }
      return failure(new Error('不明なエラーが発生しました'))
    } catch (error) {
      if (error instanceof Error) {
        return failure(error)
      }
      // biome-ignore lint/suspicious/noConsole: 未知のエラーのため
      console.error(error)
      return failure(new Error('不明なエラーが発生しました'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsUnread = useCallback(async (articleId: bigint): AsyncResult<string, Error> => {
    setIsLoading(true)
    try {
      const client = getApiClientForClient()
      const res = await client.articles[':article_id'].unread.$delete({
        param: { article_id: articleId.toString() },
      })

      if (res.status === 200) {
        const resJson = await res.json()
        return success(resJson.message)
      }
      if (res.status >= 400 && res.status < 500) {
        return failure(new Error('未読登録に失敗しました'))
      }
      if (res.status >= 500) {
        return failure(new Error('サーバーエラーが発生しました'))
      }
      return failure(new Error('不明なエラーが発生しました'))
    } catch (error) {
      if (error instanceof Error) {
        return failure(error)
      }
      // biome-ignore lint/suspicious/noConsole: 未知のエラーのため
      console.error(error)
      return failure(new Error('不明なエラーが発生しました'))
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
