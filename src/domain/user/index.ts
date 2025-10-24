import type { RdbClient } from '@/infrastructure/rdb'
import { UserCommandRepositoryImpl } from './infrastructure/commandImpl'
import QueryImpl from './infrastructure/queryImpl'
import {
  type ActiveUser,
  type ActiveUserInput,
  activeUserInputSchema,
  activeUserSchema,
} from './schema/activeUserSchema'
import { UseCase } from './useCase'

export function createUserUseCase(db: RdbClient): UseCase {
  return new UseCase(new QueryImpl(db), new UserCommandRepositoryImpl(db))
}

// 型
export type { ActiveUser, ActiveUserInput }

// スキーマ
export { activeUserSchema, activeUserInputSchema }
