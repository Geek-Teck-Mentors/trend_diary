import { RdbClient } from '@/infrastructure/rdb'
import CommandServiceImpl from './infrastructure/commandServiceImpl'
import QueryServiceImpl from './infrastructure/queryServiceImpl'
import {
  ActiveUser,
  ActiveUserInput,
  activeUserInputSchema,
  activeUserSchema,
} from './schema/activeUserSchema'
import { UseCase } from './useCase'

export function createUserUseCase(db: RdbClient): UseCase {
  return new UseCase(new QueryServiceImpl(db), new CommandServiceImpl(db))
}

// 型
export type { ActiveUser, ActiveUserInput }

// スキーマ
export { activeUserSchema, activeUserInputSchema }
