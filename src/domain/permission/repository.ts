import { AsyncResult } from '@yuukihayashi0510/core'
import { Nullable } from '@/common/types/utility'
import type { EndpointPermission, EndpointPermissionInput } from './schema/endpointPermissionSchema'
import type { Endpoint, EndpointInput } from './schema/endpointSchema'
import type { Permission, PermissionInput } from './schema/permissionSchema'
import type { RolePermission, RolePermissionInput } from './schema/rolePermissionSchema'
import type { Role, RoleInput, RoleUpdate } from './schema/roleSchema'

/**
 * パーミッションクエリリポジトリ
 */
export interface PermissionQuery {
  /**
   * ユーザーが持つ全パーミッションを取得（ロール経由）
   */
  getUserPermissions(activeUserId: bigint): AsyncResult<Permission[], Error>

  /**
   * エンドポイント（パス + メソッド）から必要な権限を取得
   */
  getRequiredPermissionsByEndpoint(path: string, method: string): AsyncResult<Permission[], Error>

  /**
   * 全パーミッション一覧を取得
   */
  findAllPermissions(): AsyncResult<Permission[], Error>

  /**
   * パーミッションIDで取得
   */
  findPermissionById(permissionId: number): AsyncResult<Nullable<Permission>, Error>

  /**
   * resource と action でパーミッションを検索
   */
  findPermissionByResourceAndAction(
    resource: string,
    action: string,
  ): AsyncResult<Nullable<Permission>, Error>
}

/**
 * パーミッションコマンドリポジトリ
 */
export interface PermissionCommand {
  /**
   * パーミッション作成
   */
  createPermission(input: PermissionInput): AsyncResult<Permission, Error>

  /**
   * パーミッション削除
   */
  deletePermission(permissionId: number): AsyncResult<void, Error>
}

/**
 * ロールクエリリポジトリ
 */
export interface RoleQuery {
  /**
   * 全ロール一覧を取得
   */
  findAllRoles(): AsyncResult<Role[], Error>

  /**
   * ロールIDで取得
   */
  findRoleById(roleId: number): AsyncResult<Nullable<Role>, Error>

  /**
   * ロールが持つパーミッション一覧を取得
   */
  findPermissionsByRoleId(roleId: number): AsyncResult<Permission[], Error>
}

/**
 * ロールコマンドリポジトリ
 */
export interface RoleCommand {
  /**
   * ロール作成
   */
  createRole(input: RoleInput): AsyncResult<Role, Error>

  /**
   * ロール更新
   */
  updateRole(roleId: number, input: RoleUpdate): AsyncResult<Role, Error>

  /**
   * ロール削除
   */
  deleteRole(roleId: number): AsyncResult<void, Error>
}

/**
 * ロールパーミッションコマンドリポジトリ
 */
export interface RolePermissionCommand {
  /**
   * ロールにパーミッションを付与
   */
  grantPermissionToRole(input: RolePermissionInput): AsyncResult<RolePermission, Error>

  /**
   * ロールからパーミッションを削除
   */
  revokePermissionFromRole(input: RolePermissionInput): AsyncResult<void, Error>

  /**
   * ロールのパーミッションを一括更新（既存を削除して新規作成）
   */
  updateRolePermissions(roleId: number, permissionIds: number[]): AsyncResult<void, Error>
}

/**
 * エンドポイントクエリリポジトリ
 */
export interface EndpointQuery {
  /**
   * 全エンドポイント一覧を取得
   */
  findAllEndpoints(): AsyncResult<Endpoint[], Error>

  /**
   * エンドポイントIDで取得
   */
  findEndpointById(endpointId: number): AsyncResult<Nullable<Endpoint>, Error>

  /**
   * エンドポイントが持つパーミッション一覧を取得
   */
  findPermissionsByEndpointId(endpointId: number): AsyncResult<Permission[], Error>
}

/**
 * エンドポイントコマンドリポジトリ
 */
export interface EndpointCommand {
  /**
   * エンドポイント作成
   */
  createEndpoint(input: EndpointInput): AsyncResult<Endpoint, Error>

  /**
   * エンドポイント削除
   */
  deleteEndpoint(endpointId: number): AsyncResult<void, Error>
}

/**
 * エンドポイントパーミッションコマンドリポジトリ
 */
export interface EndpointPermissionCommand {
  /**
   * エンドポイントにパーミッションを付与
   */
  grantPermissionToEndpoint(input: EndpointPermissionInput): AsyncResult<EndpointPermission, Error>

  /**
   * エンドポイントからパーミッションを削除
   */
  revokePermissionFromEndpoint(input: EndpointPermissionInput): AsyncResult<void, Error>

  /**
   * エンドポイントのパーミッションを一括更新
   */
  updateEndpointPermissions(endpointId: number, permissionIds: number[]): AsyncResult<void, Error>
}
