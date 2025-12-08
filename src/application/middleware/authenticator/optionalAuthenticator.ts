import { isSuccess } from '@yuukihayashi0510/core'
import { createMiddleware } from 'hono/factory'
import { Env } from '../../env'
import CONTEXT_KEY from '../context'
import { validateSession } from './authHelper'

/**
 * オプショナル認証ミドルウェア
 * - セッションがあればSESSION_USERをセット
 * - セッションがない/無効でもエラーを投げずに次のハンドラーに進む
 */
const optionalAuthenticator = createMiddleware<Env>(async (c, next) => {
  const validationResult = await validateSession(c)

  if (isSuccess(validationResult)) {
    c.set(CONTEXT_KEY.SESSION_USER, validationResult.data.sessionUser)
    c.set(CONTEXT_KEY.SESSION_ID, validationResult.data.sessionId)
  }

  return next()
})

export default optionalAuthenticator
