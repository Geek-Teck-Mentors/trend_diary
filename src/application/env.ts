import User from '@/domain/account/model/user'
import { logger } from '@/logger/logger'
import CONTEXT_KEY from './middleware/context'

export type Env = {
  Bindings: {
    DATABASE_URL: string
    DISCORD_WEBHOOK_URL: string
  }
  Variables: {
    [CONTEXT_KEY.APP_LOG]: typeof logger
    [CONTEXT_KEY.SESSION_USER]: User
    [CONTEXT_KEY.SESSION_ID]: string
  }
}
