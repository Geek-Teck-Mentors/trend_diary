import { Nullable } from '@/common/types/utility'
import { logger } from '@/logger/logger'
import CONTEXT_KEY from './middleware/context'

export type SessionUser = {
  userId: bigint // userId から userId に変更
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
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
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
