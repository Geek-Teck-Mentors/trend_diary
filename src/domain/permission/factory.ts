import { RdbClient } from '@/infrastructure/rdb'
import { AuthorizationUseCase } from './authorizationUseCase'
import { EndpointUseCase } from './endpointUseCase'
import { EndpointCommandImpl } from './infrastructure/endpointCommandImpl'
import { EndpointPermissionCommandImpl } from './infrastructure/endpointPermissionCommandImpl'
import { EndpointQueryImpl } from './infrastructure/endpointQueryImpl'
import { PermissionCommandImpl } from './infrastructure/permissionCommandImpl'
import { PermissionQueryImpl } from './infrastructure/queryImpl'
import { RoleCommandImpl } from './infrastructure/roleCommandImpl'
import { RolePermissionCommandImpl } from './infrastructure/rolePermissionCommandImpl'
import { RoleQueryImpl } from './infrastructure/roleQueryImpl'
import { PermissionUseCase } from './permissionUseCase'
import { RoleUseCase } from './roleUseCase'
import { UseCase } from './useCase'

/**
 * 権限のCRUD操作を行うユースケースのファクトリ関数
 */
export function createPermissionUseCase(db: RdbClient): PermissionUseCase {
  return new PermissionUseCase(new PermissionQueryImpl(db), new PermissionCommandImpl(db))
}

/**
 * ロールのCRUD操作とロール-権限の紐付けを行うユースケースのファクトリ関数
 */
export function createRoleUseCase(db: RdbClient): RoleUseCase {
  return new RoleUseCase(
    new RoleQueryImpl(db),
    new RoleCommandImpl(db),
    new RolePermissionCommandImpl(db),
  )
}

/**
 * エンドポイントのCRUD操作とエンドポイント-権限の紐付けを行うユースケースのファクトリ関数
 */
export function createEndpointUseCase(db: RdbClient): EndpointUseCase {
  return new EndpointUseCase(
    new EndpointQueryImpl(db),
    new EndpointCommandImpl(db),
    new EndpointPermissionCommandImpl(db),
  )
}

/**
 * 権限チェックを行うユースケースのファクトリ関数
 */
export function createAuthorizationUseCase(db: RdbClient): AuthorizationUseCase {
  return new AuthorizationUseCase(new PermissionQueryImpl(db))
}

/**
 * 全ての権限管理機能を含む統合ユースケースのファクトリ関数
 * @deprecated 責務が多すぎるため、個別のユースケースを使用することを推奨
 */
export function createLegacyPermissionUseCase(db: RdbClient): UseCase {
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
