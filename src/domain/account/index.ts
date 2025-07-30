// リポジトリ実装
import ActiveUserRepositoryImpl from './infrastructure/activeUserRepositoryImpl'
import UserRepositoryImpl from './infrastructure/userRepositoryImpl'
import SessionRepositoryImpl from './infrastructure/sessionRepositoryImpl'

// スキーマと型
import { ActiveUserInput, ActiveUserUpdate, ActiveUserOutput, activeUserSchema, activeUserInputSchema, activeUserUpdateSchema } from './schema/activeUserSchema'
import { UserInput, UserOutput, userSchema } from './schema/userSchema'
import { SessionInput, SessionUpdate, SessionOutput, sessionSchema, sessionInputSchema, sessionUpdateSchema } from './schema/sessionSchema'

// サービス
import ActiveUserService from './service/activeUserService'
import UserService from './service/userService'
import AccountService from './service/accountService'

// 型エクスポート
export type { 
  ActiveUserInput, 
  ActiveUserUpdate, 
  ActiveUserOutput, 
  UserInput, 
  UserOutput,
  SessionInput,
  SessionUpdate,
  SessionOutput
}

// スキーマエクスポート
export { 
  activeUserSchema, 
  activeUserInputSchema, 
  activeUserUpdateSchema,
  userSchema,
  sessionSchema,
  sessionInputSchema,
  sessionUpdateSchema
}

// 互換性のための非推奨エクスポート
export { activeUserSchema as accountSchema }

// サービスエクスポート
export { ActiveUserService, UserService, AccountService }

// リポジトリ実装エクスポート
export { ActiveUserRepositoryImpl, UserRepositoryImpl, SessionRepositoryImpl }

// 互換性のための非推奨エクスポート
export { ActiveUserRepositoryImpl as AccountRepositoryImpl }
