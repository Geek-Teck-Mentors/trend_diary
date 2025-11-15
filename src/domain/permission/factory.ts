import { RdbClient } from '@/infrastructure/rdb'
import { EndpointCommandImpl } from './infrastructure/endpointCommandImpl'
import { EndpointPermissionCommandImpl } from './infrastructure/endpointPermissionCommandImpl'
import { EndpointQueryImpl } from './infrastructure/endpointQueryImpl'
import { PermissionCommandImpl } from './infrastructure/permissionCommandImpl'
import { PermissionQueryImpl } from './infrastructure/queryImpl'
import { RoleCommandImpl } from './infrastructure/roleCommandImpl'
import { RolePermissionCommandImpl } from './infrastructure/rolePermissionCommandImpl'
import { RoleQueryImpl } from './infrastructure/roleQueryImpl'
import { UseCase } from './useCase'

/**
 * PermissionUseCaseのファクトリ関数
 */
export function createPermissionUseCase(db: RdbClient): UseCase {
  return new UseCase(
    new PermissionQueryImpl(db),
    new PermissionCommandImpl(db),
    new RoleQueryImpl(db),
    new RoleCommandImpl(db),
    new RolePermissionCommandImpl(db),
    new EndpointQueryImpl(db),
    new EndpointCommandImpl(db),
    new EndpointPermissionCommandImpl(db),
  )
}
