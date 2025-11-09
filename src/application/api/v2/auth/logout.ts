import { isFailure } from '@yuukihayashi0510/core'
import type { Context } from 'hono'
import { deleteCookie, getCookie } from 'hono/cookie'
import CONTEXT_KEY from '@/application/middleware/context'
import { SESSION_NAME } from '@/common/constants'
import { handleError } from '@/common/errors'
import { createAuthV2UseCase } from '@/domain/auth-v2'
import getRdbClient from '@/infrastructure/rdb'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function logout(c: Context) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const client = createSupabaseAuthClient(c)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createAuthV2UseCase(client, rdb)

  // HTTPセッションを削除
  const sessionId = getCookie(c, SESSION_NAME)
  if (sessionId) {
    const deleteSessionResult = await useCase.deleteSession(sessionId)
    if (isFailure(deleteSessionResult)) {
      logger.warn('Failed to delete session from database', { error: deleteSessionResult.error })
    }
  }

  // Supabaseログアウト処理を実行
  const result = await useCase.logout()

  // エラーが発生した場合はログに記録し、エラーレスポンスを返す
  // 既にログアウト済みの場合でもSupabaseはエラーを返さないため、
  // エラーが返ってきた場合は実際の問題（ネットワークエラー、サーバーエラーなど）
  if (isFailure(result)) {
    logger.error('logout failed', { error: result.error })
    throw handleError(result.error, logger)
  }

  // セッションCookieを削除
  deleteCookie(c, SESSION_NAME)

  logger.info('logout success')

  return c.body(null, 204)
}
