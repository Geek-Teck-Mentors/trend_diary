import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { Env } from '../env'
import { validateSession } from './authHelper'
import CONTEXT_KEY from './context'

const authenticator = createMiddleware<Env>(async (c, next) => {
  const validationResult = await validateSession(c)

  if (!validationResult.success) {
    // ユーザーが見つからない場合は404、それ以外は401
    const statusCode = validationResult.reason === 'user_not_found' ? 404 : 401
    throw new HTTPException(statusCode, { message: 'login required' })
  }

  c.set(CONTEXT_KEY.SESSION_USER, validationResult.sessionUser)
  c.set(CONTEXT_KEY.SESSION_ID, validationResult.sessionId)
  return next()
})

export default authenticator
