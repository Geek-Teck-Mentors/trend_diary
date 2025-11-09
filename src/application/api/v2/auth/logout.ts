import { isFailure } from '@yuukihayashi0510/core'
import type { Context } from 'hono'
import CONTEXT_KEY from '@/application/middleware/context'
import { createAuthV2UseCase } from '@/domain/auth-v2'
import getRdbClient from '@/infrastructure/rdb'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'
import { handleError } from '../errorHandler'

export default async function logout(c: Context) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const client = createSupabaseAuthClient(c)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createAuthV2UseCase(client, rdb)

  // ログアウト処理を実行
  const result = await useCase.logout()

  // エラーが発生した場合はログに記録し、エラーレスポンスを返す
  // 既にログアウト済みの場合でもSupabaseはエラーを返さないため、
  // エラーが返ってきた場合は実際の問題（ネットワークエラー、サーバーエラーなど）
  if (isFailure(result)) {
    logger.error('logout failed', { error: result.error })
    throw handleError(result.error)
  }

  logger.info('logout success')

  return c.body(null, 204)
}
