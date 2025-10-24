import { PrismaClient } from '@prisma/client'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { ClientError, ServerError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { AuthRepositoryImpl } from '@/infrastructure/auth/authRepositoryImpl'
import { createAuthClient } from '@/infrastructure/auth/supabaseClient'
import getRdbClient from '@/infrastructure/rdb'
import type { Env, SessionUser } from '../env'
import CONTEXT_KEY from './context'

const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  // Cookieからアクセストークンを取得
  const accessToken = getCookie(c, 'sb-access-token')
  if (!accessToken) {
    throw new HTTPException(401, { message: 'login required' })
  }

  // Supabase Authでトークンを検証
  const supabaseClient = createAuthClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)
  const authRepository = new AuthRepositoryImpl(supabaseClient)
  const authResult = await authRepository.getUser(accessToken)

  if (isError(authResult)) {
    if (authResult.error instanceof ClientError) {
      throw new HTTPException(authResult.error.statusCode as ContentfulStatusCode, {
        message: authResult.error.message,
      })
    }
    if (authResult.error instanceof ServerError) {
      logger.error('Error occurred while authenticating', {
        error: authResult.error,
      })
      throw new HTTPException(authResult.error.statusCode as ContentfulStatusCode, {
        message: 'Internal Server Error',
      })
    }
    logger.error('Unexpected error occurred', { error: authResult.error })
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }

  // SupabaseIdからUserテーブルの情報を取得
  const rdb = getRdbClient(c.env.DATABASE_URL) as PrismaClient
  const user = await rdb.user.findUnique({
    where: { supabaseId: authResult.data.id },
    include: {
      adminUser: true,
    },
  })

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' })
  }

  // セッションユーザー情報を設定
  const sessionUser: SessionUser = {
    userId: user.userId,
    displayName: null,
    email: authResult.data.email,
    isAdmin: !!user.adminUser,
    adminUserId: user.adminUser?.adminUserId ?? null,
  }

  c.set(CONTEXT_KEY.SESSION_USER, sessionUser)
  return next()
})

export default authMiddleware
