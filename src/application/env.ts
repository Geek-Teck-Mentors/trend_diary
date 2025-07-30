import { logger } from '@/logger/logger'
import CONTEXT_KEY from './middleware/context'

export type SessionUser = {
  userId: bigint
  activeUserId: bigint
  displayName: string | null | undefined
  email: string
}

export type Env = {
  Bindings: {
    DATABASE_URL: string
    DISCORD_WEBHOOK_URL: string
  }
  Variables: {
    [CONTEXT_KEY.APP_LOG]: typeof logger
    [CONTEXT_KEY.SESSION_USER]: SessionUser
    [CONTEXT_KEY.SESSION_ID]: string
  }
}
