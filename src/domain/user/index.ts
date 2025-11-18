import { RdbClient } from '@/infrastructure/rdb'
import CommandImpl from './infrastructure/commandImpl'
import QueryImpl from './infrastructure/queryImpl'
import {
  ActiveUser,
  ActiveUserInput,
  CurrentUser,
  activeUserInputSchema,
  activeUserSchema,
  currentUserSchema,
} from './schema/activeUserSchema'
import { UseCase } from './useCase'

export function createUserUseCase(db: RdbClient): UseCase {
  return new UseCase(new QueryImpl(db), new CommandImpl(db))
}

// 型
export type { ActiveUser, ActiveUserInput, CurrentUser }

// スキーマ
export { activeUserSchema, activeUserInputSchema, currentUserSchema }
