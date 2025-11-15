import { AsyncResult } from '@yuukihayashi0510/core'
import { Nullable } from '@/common/types/utility'
import type { Endpoint } from './schema/endpointSchema'
import type { Permission } from './schema/permissionSchema'
import type { Role } from './schema/roleSchema'
import type { UserRole, UserRoleInput, UserRoleRevoke } from './schema/userRoleSchema'

/**
 * パーミッションクエリリポジトリ
 */
export interface PermissionQuery {
  /**
   * ユーザーが持つ全ロールを取得（有効期限内かつ未剥奪のもの）
   */
  getUserRoles(activeUserId: bigint): AsyncResult<Role[], Error>

  /**
   * ユーザーが持つ全パーミッションを取得（ロール経由）
   */
  getUserPermissions(activeUserId: bigint): AsyncResult<Permission[], Error>

  /**
   * ロール名からロールを取得
   */
  getRoleByName(roleName: string): AsyncResult<Nullable<Role>, Error>

  /**
   * リソースとアクションからパーミッションを取得
   */
  getPermissionByResourceAction(
    resource: string,
    action: string,
  ): AsyncResult<Nullable<Permission>, Error>

  /**
   * ユーザーロールの関連情報を取得
   */
  getUserRoleByUserAndRole(
    activeUserId: bigint,
    roleId: number,
  ): AsyncResult<Nullable<UserRole>, Error>

  /**
   * エンドポイント（パス + メソッド）から必要な権限を取得
   */
  getRequiredPermissionsByEndpoint(path: string, method: string): AsyncResult<Permission[], Error>
}

/**
 * パーミッションコマンドリポジトリ
 */
export interface PermissionCommand {
  /**
   * ユーザーにロールを付与
   */
  assignRole(input: UserRoleInput): AsyncResult<UserRole, Error>

  /**
   * ユーザーからロールを剥奪
   */
  revokeRole(input: UserRoleRevoke): AsyncResult<UserRole, Error>
}
