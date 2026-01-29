import { LoggerType, LogLevel } from '@/common/logger'
import { Nullable } from '@/common/types/utility'
import CONTEXT_KEY from './middleware/context'

export type SessionUser = {
  activeUserId: bigint
  displayName?: Nullable<string>
  email: string
}

export type Env = {
  Bindings: {
    DATABASE_URL: string
    DISCORD_WEBHOOK_URL: string
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    LOG_LEVEL?: LogLevel
  }
  Variables: {
    [CONTEXT_KEY.APP_LOG]: LoggerType
    [CONTEXT_KEY.SESSION_USER]: SessionUser
    [CONTEXT_KEY.SESSION_ID]: string
  }
}

declare module 'react-router' {
  interface AppLoadContext {
    whatever: string
  }
}
