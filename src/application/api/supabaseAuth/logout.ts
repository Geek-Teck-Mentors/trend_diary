import type { Context } from 'hono'
import CONTEXT_KEY from '@/application/middleware/context'
import { createSupabaseAuthenticationUseCase } from '@/domain/supabaseAuth'
import getRdbClient from '@/infrastructure/rdb'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function logout(c: Context) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const client = createSupabaseAuthClient(c)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createSupabaseAuthenticationUseCase(client, rdb)

  // ログアウトはエラーが発生しても無視する（冪等性）
  await useCase.logout()

  logger.info('logout success')

  return c.body(null, 204)
}
