import { isFailure } from '@yuukihayashi0510/core'
import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { z } from 'zod'
import { SESSION_NAME } from '@/common/constants'
import { ClientError, ServerError } from '@/common/errors'
import { createAdminQuery } from '@/domain/admin'
import { createUserUseCase } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'
import type { Env, SessionUser } from '../env'
import CONTEXT_KEY from './context'

type AuthValidationResult =
  | { success: true; sessionUser: SessionUser; sessionId: string }
  | {
      success: false
      reason: 'no_session' | 'invalid_format' | 'validation_failed' | 'user_not_found'
    }

/**
 * セッション検証の共通ロジック
 * @param c Honoコンテキスト
 * @returns セッション検証結果
 */
export async function validateSession(c: Context<Env>): Promise<AuthValidationResult> {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  // セッションIDを取得
  const sessionId = getCookie(c, SESSION_NAME)
  if (!sessionId) {
    return { success: false, reason: 'no_session' }
  }

  // SQLインジェクション対策
  const valid = z.string().uuid().safeParse(sessionId)
  if (!valid.success) {
    logger.warn('invalid sid format', { sessionId })
    return { success: false, reason: 'invalid_format' }
  }

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createUserUseCase(rdb)

  // ユーザー情報を取得
  const result = await useCase.getCurrentUser(sessionId)
  if (isFailure(result)) {
    if (result.error instanceof ClientError || result.error instanceof ServerError) {
      logger.warn('Session validation failed', { error: result.error })
    } else {
      logger.error('Unexpected error occurred', { error: result.error })
    }
    return { success: false, reason: 'validation_failed' }
  }

  if (!result.data) {
    return { success: false, reason: 'user_not_found' }
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

  return { success: true, sessionUser, sessionId }
}
