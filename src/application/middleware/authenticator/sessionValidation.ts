import { failure, isFailure, type Result, success } from '@yuukihayashi0510/core'
import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { z } from 'zod'
import { SESSION_NAME } from '@/common/constants'
import { ClientError, ServerError } from '@/common/errors'
import { createUserUseCase } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'
import type { Env, SessionUser } from '../../env'
import CONTEXT_KEY from '../context'

type AuthValidationSuccess = {
  sessionUser: SessionUser
  sessionId: string
}

type AuthValidationError = Error & {
  reason: 'no_session' | 'invalid_format' | 'validation_failed' | 'user_not_found'
}

/**
 * 認証エラーを作成
 */
function createAuthValidationError(
  reason: 'no_session' | 'invalid_format' | 'validation_failed' | 'user_not_found',
  message: string,
): AuthValidationError {
  const error = new Error(message) as AuthValidationError
  error.reason = reason
  return error
}

/**
 * セッション検証の共通ロジック
 * @param c Honoコンテキスト
 * @returns セッション検証結果
 */
export async function validateSession(
  c: Context<Env>,
): Promise<Result<AuthValidationSuccess, AuthValidationError>> {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  // セッションIDを取得
  const sessionId = getCookie(c, SESSION_NAME)
  if (!sessionId) {
    return failure(createAuthValidationError('no_session', 'No session cookie found'))
  }

  // SQLインジェクション対策
  const valid = z.string().uuid().safeParse(sessionId)
  if (!valid.success) {
    logger.warn('invalid sid format', { sessionId })
    return failure(createAuthValidationError('invalid_format', 'Invalid session ID format'))
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
    return failure(createAuthValidationError('validation_failed', 'Session validation failed'))
  }

  if (!result.data) {
    return failure(createAuthValidationError('user_not_found', 'User not found'))
  }

  // 管理者権限をチェック

  const sessionUser: SessionUser = {
    activeUserId: result.data.activeUserId,
    displayName: result.data.displayName,
    email: result.data.email,
  }

  return success({ sessionUser, sessionId })
}
