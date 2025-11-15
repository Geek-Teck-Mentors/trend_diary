import { RdbClient } from '@/infrastructure/rdb'
import { PermissionQueryImpl } from './infrastructure/queryImpl'
import { UseCase } from './useCase'

/**
 * PermissionUseCaseのファクトリ関数
 */
export function createPermissionUseCase(db: RdbClient): UseCase {
  return new UseCase(new PermissionQueryImpl(db))
}
