import { isFailure } from '@yuukihayashi0510/core'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { z } from 'zod'
import { SESSION_NAME } from '@/common/constants'
import { createAdminQuery } from '@/domain/admin'
import { createUserUseCase } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'
import { Env, SessionUser } from '../env'
import CONTEXT_KEY from './context'

/**
 * オプショナル認証ミドルウェア
 * - セッションがあればSESSION_USERをセット
 * - セッションがない/無効でもエラーを投げずに次のハンドラーに進む
 */
const optionalAuthenticator = createMiddleware<Env>(async (c, next) => {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const sessionId = getCookie(c, SESSION_NAME)
  if (!sessionId) {
    // セッションCookieがない場合はそのまま次へ
    return next()
  }

  // SQLインジェクション対策
  const valid = z.string().uuid().safeParse(sessionId)
  if (!valid.success) {
    logger.warn('invalid sid format', { sessionId })
    // 無効なセッション形式の場合はそのまま次へ
    return next()
  }

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createUserUseCase(rdb)

  const result = await useCase.getCurrentUser(sessionId)
  if (isFailure(result)) {
    logger.warn('Session validation failed', { error: result.error })
    // セッション検証失敗時はそのまま次へ
    return next()
  }

  if (!result.data) {
    // ユーザーが見つからない場合はそのまま次へ
    return next()
  }

  // 管理者権限をチェック
  const adminQuery = createAdminQuery(rdb)
  const hasAdminAccess = await adminQuery.hasAdminPermissions(result.data.activeUserId)

  const sessionUser: SessionUser = {
    activeUserId: result.data.activeUserId,
    displayName: result.data.displayName,
    email: result.data.email,
    hasAdminAccess,
  }

  c.set(CONTEXT_KEY.SESSION_USER, sessionUser)
  c.set(CONTEXT_KEY.SESSION_ID, sessionId)
  return next()
})

export default optionalAuthenticator
