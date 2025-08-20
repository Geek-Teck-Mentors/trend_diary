import { logger } from '@/logger/logger'
import CONTEXT_KEY from './middleware/context'
import { Nullable } from '@/common/types/utility'

export type SessionUser = {
  activeUserId: bigint
  displayName?: Nullable<string>
  email: string
  isAdmin: boolean
  adminUserId: Nullable<number>
}

export type Env = {
  Bindings: {
    DATABASE_URL: string
    DISCORD_WEBHOOK_URL: string
    FEATURE_USER_ENABLED: string
  }
  Variables: {
    [CONTEXT_KEY.APP_LOG]: typeof logger
    [CONTEXT_KEY.SESSION_USER]: SessionUser
    [CONTEXT_KEY.SESSION_ID]: string
  }
}

declare module 'react-router' {
  interface AppLoadContext {
    whatever: string
  }
}
