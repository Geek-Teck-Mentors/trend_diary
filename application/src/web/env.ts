import { LoggerType, LogLevel } from '@/common/logger'
import { Nullable } from '@/common/types/utility'
import CONTEXT_KEY from './middleware/context'

type D1Database = import('@cloudflare/workers-types').D1Database

type RateLimit = {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

export type SessionUser = {
  activeUserId: bigint
  displayName?: Nullable<string>
  email: string
}

export type Env = {
  Bindings: {
    DB?: D1Database
    DATABASE_URL?: string
    DISCORD_WEBHOOK_URL: string
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY?: string
    LOG_LEVEL?: LogLevel
    STRICT_RATE_LIMITER?: RateLimit
    DEFAULT_RATE_LIMITER?: RateLimit
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
