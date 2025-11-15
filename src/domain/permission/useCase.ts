import { AsyncResult, isFailure, success } from '@yuukihayashi0510/core'
import type { PermissionCommand, PermissionQuery } from './repository'
import type { Permission } from './schema/permissionSchema'
import type { Role } from './schema/roleSchema'
import type { UserRole, UserRoleInput, UserRoleRevoke } from './schema/userRoleSchema'

/**
 * パーミッション管理のユースケース
 */
export class UseCase {
  constructor(
    private query: PermissionQuery,
    private command: PermissionCommand,
  ) {}

  /**
   * ユーザーが特定のパーミッションを持っているか判定
   * @param activeUserId ユーザーID
   * @param resource リソース名
   * @param action アクション名
   * @returns 権限を持っている場合true
   */
  async hasPermission(
    activeUserId: bigint,
    resource: string,
    action: string,
  ): AsyncResult<boolean, Error> {
    const permissionsResult = await this.query.getUserPermissions(activeUserId)
    if (isFailure(permissionsResult)) {
      return permissionsResult
    }

    const hasPermission = permissionsResult.data.some(
      (p) => p.resource === resource && p.action === action,
    )

    return success(hasPermission)
  }

  /**
   * ユーザーが特定のロールを持っているか判定
   * @param activeUserId ユーザーID
   * @param roleName ロール名
   * @returns ロールを持っている場合true
   */
  async hasRole(activeUserId: bigint, roleName: string): AsyncResult<boolean, Error> {
    const rolesResult = await this.query.getUserRoles(activeUserId)
    if (isFailure(rolesResult)) {
      return rolesResult
    }

    const hasRole = rolesResult.data.some((r) => r.name === roleName)
    return success(hasRole)
  }

  /**
   * ユーザーのロール一覧を取得
   * @param activeUserId ユーザーID
   * @returns ロール一覧
   */
  async getUserRoles(activeUserId: bigint): AsyncResult<Role[], Error> {
    return await this.query.getUserRoles(activeUserId)
  }

  /**
   * ユーザーのパーミッション一覧を取得
   * @param activeUserId ユーザーID
   * @returns パーミッション一覧
   */
  async getUserPermissions(activeUserId: bigint): AsyncResult<Permission[], Error> {
    return await this.query.getUserPermissions(activeUserId)
  }

  /**
   * ユーザーにロールを付与
   * @param input ロール付与情報
   * @returns 付与されたUserRole
   */
  async assignRole(input: UserRoleInput): AsyncResult<UserRole, Error> {
    // すでにロールが付与されているか確認
    const existingResult = await this.query.getUserRoleByUserAndRole(
      input.activeUserId,
      input.roleId,
    )
    if (isFailure(existingResult)) {
      return existingResult
    }

    // すでに有効なロールがある場合はエラー
    if (existingResult.data && !existingResult.data.revokedAt) {
      return {
        success: false,
        error: new Error('ユーザーはすでにこのロールを持っている'),
      }
    }

    return await this.command.assignRole(input)
  }

  /**
   * ユーザーからロールを剥奪
   * @param input ロール剥奪情報
   * @returns 剥奪されたUserRole
   */
  async revokeRole(input: UserRoleRevoke): AsyncResult<UserRole, Error> {
    // ロールが付与されているか確認
    const existingResult = await this.query.getUserRoleByUserAndRole(
      input.activeUserId,
      input.roleId,
    )
    if (isFailure(existingResult)) {
      return existingResult
    }

    if (!existingResult.data) {
      return {
        success: false,
        error: new Error('ユーザーはこのロールを持っていない'),
      }
    }

    if (existingResult.data.revokedAt) {
      return {
        success: false,
        error: new Error('このロールはすでに剥奪されている'),
      }
    }

    return await this.command.revokeRole(input)
  }
}
