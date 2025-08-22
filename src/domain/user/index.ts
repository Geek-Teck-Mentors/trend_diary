import { RdbClient } from '@/infrastructure/rdb'
import CommandImpl from './infrastructure/commandImpl'
import QueryImpl from './infrastructure/queryImpl'
import {
  ActiveUser,
  ActiveUserInput,
  activeUserInputSchema,
  activeUserSchema,
} from './schema/activeUserSchema'
import { UseCase } from './useCase'

export function createUserUseCase(db: RdbClient): UseCase {
  return new UseCase(new QueryImpl(db), new CommandImpl(db))
}

// 型
export type { ActiveUser, ActiveUserInput }

// スキーマ
export { activeUserSchema, activeUserInputSchema }
