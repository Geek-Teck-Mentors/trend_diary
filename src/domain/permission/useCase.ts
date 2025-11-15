import { AsyncResult, failure, isFailure, success } from '@yuukihayashi0510/core'
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
   * ユーザーがエンドポイントにアクセスできるか判定
   * @param activeUserId ユーザーID
   * @param path エンドポイントパス
   * @param method HTTPメソッド
   * @returns アクセスできる場合true
   */
  async hasEndpointPermission(
    activeUserId: bigint,
    path: string,
    method: string,
  ): AsyncResult<boolean, Error> {
    // エンドポイントに必要な権限を取得
    const requiredPermissionsResult = await this.query.getRequiredPermissionsByEndpoint(
      path,
      method,
    )
    if (isFailure(requiredPermissionsResult)) {
      return requiredPermissionsResult
    }

    // エンドポイントが登録されていない場合は権限不要（後方互換性のため）
    if (requiredPermissionsResult.data.length === 0) {
      return success(true)
    }

    // ユーザーの権限を取得
    const userPermissionsResult = await this.query.getUserPermissions(activeUserId)
    if (isFailure(userPermissionsResult)) {
      return userPermissionsResult
    }

    // 必要な権限を全て持っているかチェック
    const hasAllPermissions = requiredPermissionsResult.data.every((required) =>
      userPermissionsResult.data.some(
        (userPerm) =>
          userPerm.permissionId === required.permissionId ||
          (userPerm.resource === required.resource && userPerm.action === required.action),
      ),
    )

    return success(hasAllPermissions)
  }

  /**
   * ユーザーが特定のロールを持っているか判定
   * @param activeUserId ユーザーID
   * @param displayName ロール表示名
   * @returns ロールを持っている場合true
   */
  async hasRole(activeUserId: bigint, displayName: string): AsyncResult<boolean, Error> {
    const rolesResult = await this.query.getUserRoles(activeUserId)
    if (isFailure(rolesResult)) {
      return rolesResult
    }

    const hasRole = rolesResult.data.some((r) => r.displayName === displayName)
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

    // すでにロールがある場合はエラー
    if (existingResult.data) {
      return failure(new Error('ユーザーはすでにこのロールを持っている'))
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
      return failure(new Error('ユーザーはこのロールを持っていない'))
    }

    return await this.command.revokeRole(input)
  }
}
