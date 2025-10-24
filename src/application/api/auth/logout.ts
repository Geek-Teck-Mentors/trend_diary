import type { Context } from 'hono'
import { deleteCookie } from 'hono/cookie'
import type { Env } from '@/application/env'
import CONTEXT_KEY from '@/application/middleware/context'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createAuthUseCase } from '@/domain/auth/useCase'
import { UserCommandRepositoryImpl } from '@/domain/user/infrastructure/commandImpl'
import { AuthRepositoryImpl } from '@/infrastructure/auth/authRepositoryImpl'
import { createAuthClient } from '@/infrastructure/auth/supabaseClient'
import getRdbClient from '@/infrastructure/rdb'

export default async function logout(c: Context<Env>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  // Supabase Authクライアント作成
  const supabaseClient = createAuthClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)

  // リポジトリとユースケース作成
  const authRepository = new AuthRepositoryImpl(supabaseClient)
  const rdb = getRdbClient(c.env.DATABASE_URL)
  const userCommandRepository = new UserCommandRepositoryImpl(rdb)
  const useCase = createAuthUseCase(authRepository, userCommandRepository)

  // ログアウト
  const result = await useCase.signOut()
  if (isError(result)) throw handleError(result.error, logger)

  // Cookieを削除
  deleteCookie(c, 'sb-access-token')
  deleteCookie(c, 'sb-refresh-token')

  logger.info('logout success')
  return c.json({ message: 'Logged out successfully' })
}
