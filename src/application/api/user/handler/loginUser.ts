import { Context } from 'hono'
import { Env } from '@/application/env'
import CONTEXT_KEY from '@/application/middleware/context'

export default async function loginUser(c: Context<Env>) {
  const sessionUser = c.get(CONTEXT_KEY.SESSION_USER)

  return c.json(
    {
      user: {
        displayName: sessionUser.displayName ?? '',
        hasAdminAccess: sessionUser.hasAdminAccess ?? false,
      },
    },
    200,
  )
}
