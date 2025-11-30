import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { useCallback, useState } from 'react'
import getApiClientForClient from '../../../infrastructure/api'

type UseReadArticleReturn = {
  markAsRead: (articleId: bigint) => AsyncResult<string, Error>
  markAsUnread: (articleId: bigint) => AsyncResult<string, Error>
  isLoading: boolean
}

export default function useReadArticle(): UseReadArticleReturn {
  const [isLoading, setIsLoading] = useState(false)

  const handleApiCall = useCallback(
    async (
      apiCall: () => Promise<Response>,
      successStatus: number,
      clientErrorMessage: string,
    ): AsyncResult<string, Error> => {
      setIsLoading(true)
      try {
        const result = await wrapAsyncCall(apiCall)
        if (isFailure(result)) {
          return failure(result.error)
        }

        const res = result.data

        if (res.status === successStatus) {
          const resJsonResult = await wrapAsyncCall(() => res.json())
          if (isFailure(resJsonResult)) {
            return failure(resJsonResult.error)
          }
          const resJson = resJsonResult.data as { message: string }
          return success(resJson.message)
        }
        if (res.status >= 400 && res.status < 500) {
          return failure(new Error(clientErrorMessage))
        }
        if (res.status >= 500) {
          return failure(new Error('サーバーエラーが発生しました'))
        }
        return failure(new Error('不明なエラーが発生しました'))
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const markAsRead = useCallback(
    async (articleId: bigint): AsyncResult<string, Error> => {
      const client = getApiClientForClient()
      return handleApiCall(
        () =>
          client.articles[':article_id'].read.$post({
            param: { article_id: articleId.toString() },
            json: { read_at: new Date().toISOString() },
          } as never),
        201,
        '既読登録に失敗しました',
      )
    },
    [handleApiCall],
  )

  const markAsUnread = useCallback(
    async (articleId: bigint): AsyncResult<string, Error> => {
      const client = getApiClientForClient()
      return handleApiCall(
        () =>
          client.articles[':article_id'].unread.$delete({
            param: { article_id: articleId.toString() },
          } as never),
        200,
        '未読登録に失敗しました',
      )
    },
    [handleApiCall],
  )

  return {
    markAsRead,
    markAsUnread,
    isLoading,
  }
}
