import type { Context } from 'hono'
import CONTEXT_KEY from '@/application/middleware/context'
import { createSupabaseAuthUseCase } from '@/domain/supabaseAuth'
import { createSupabaseAuthClient } from '@/infrastructure/supabase'

export default async function logout(c: Context) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const client = createSupabaseAuthClient(c)
  const useCase = createSupabaseAuthUseCase(client)

  // ログアウトはエラーが発生しても無視する（冪等性）
  await useCase.logout()

  logger.info('logout success')

  return c.body(null, 204)
}
