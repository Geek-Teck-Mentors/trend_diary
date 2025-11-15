import { AsyncResult, isFailure, success } from '@yuukihayashi0510/core'
import type { PermissionQuery } from './repository'

/**
 * パーミッション管理のユースケース
 */
export class UseCase {
  constructor(private query: PermissionQuery) {}

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
    const requiredPermissionsResult = await this.query.getRequiredPermissionsByEndpoint(
      path,
      method,
    )
    if (isFailure(requiredPermissionsResult)) {
      return requiredPermissionsResult
    }

    if (requiredPermissionsResult.data.length === 0) {
      return success(false)
    }

    const userPermissionsResult = await this.query.getUserPermissions(activeUserId)
    if (isFailure(userPermissionsResult)) {
      return userPermissionsResult
    }

    const hasAllPermissions = requiredPermissionsResult.data.every((required) =>
      userPermissionsResult.data.some(
        (userPerm) => userPerm.permissionId === required.permissionId,
      ),
    )

    return success(hasAllPermissions)
  }
}
