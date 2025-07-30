// リポジトリ実装
import ActiveUserRepositoryImpl from './infrastructure/activeUserRepositoryImpl'
import SessionRepositoryImpl from './infrastructure/sessionRepositoryImpl'
import UserRepositoryImpl from './infrastructure/userRepositoryImpl'

// スキーマと型
import {
  ActiveUserInput,
  ActiveUserOutput,
  ActiveUserUpdate,
  activeUserInputSchema,
  activeUserSchema,
  activeUserUpdateSchema,
} from './schema/activeUserSchema'
import {
  SessionInput,
  SessionOutput,
  SessionUpdate,
  sessionInputSchema,
  sessionSchema,
  sessionUpdateSchema,
} from './schema/sessionSchema'
import { UserInput, UserOutput, userSchema } from './schema/userSchema'
import AccountService from './service/accountService'
// サービス
import ActiveUserService from './service/activeUserService'
import UserService from './service/userService'

// 型エクスポート
export type {
  ActiveUserInput,
  ActiveUserUpdate,
  ActiveUserOutput,
  UserInput,
  UserOutput,
  SessionInput,
  SessionUpdate,
  SessionOutput,
}

// スキーマエクスポート
export {
  activeUserSchema,
  activeUserInputSchema,
  activeUserUpdateSchema,
  userSchema,
  sessionSchema,
  sessionInputSchema,
  sessionUpdateSchema,
}

// 互換性のための非推奨エクスポート
export { activeUserSchema as accountSchema }

// サービスエクスポート
export { ActiveUserService, UserService, AccountService }

// リポジトリ実装エクスポート
export { ActiveUserRepositoryImpl, UserRepositoryImpl, SessionRepositoryImpl }

// 互換性のための非推奨エクスポート
export { ActiveUserRepositoryImpl as AccountRepositoryImpl }
