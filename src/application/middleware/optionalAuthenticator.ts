import { createMiddleware } from 'hono/factory'
import { Env } from '../env'
import { validateSession } from './authHelper'
import CONTEXT_KEY from './context'

/**
 * オプショナル認証ミドルウェア
 * - セッションがあればSESSION_USERをセット
 * - セッションがない/無効でもエラーを投げずに次のハンドラーに進む
 */
const optionalAuthenticator = createMiddleware<Env>(async (c, next) => {
  const validationResult = await validateSession(c)

  if (validationResult.success) {
    c.set(CONTEXT_KEY.SESSION_USER, validationResult.sessionUser)
    c.set(CONTEXT_KEY.SESSION_ID, validationResult.sessionId)
  }

  return next()
})

export default optionalAuthenticator
