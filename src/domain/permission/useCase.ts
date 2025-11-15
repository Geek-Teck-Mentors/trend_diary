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
    // エンドポイントに必要な権限を取得
    const requiredPermissionsResult = await this.query.getRequiredPermissionsByEndpoint(
      path,
      method,
    )
    if (isFailure(requiredPermissionsResult)) {
      return requiredPermissionsResult
    }

    // エンドポイントが登録されていない場合はアクセス拒否
    if (requiredPermissionsResult.data.length === 0) {
      return success(false)
    }

    // ユーザーの権限を取得
    const userPermissionsResult = await this.query.getUserPermissions(activeUserId)
    if (isFailure(userPermissionsResult)) {
      return userPermissionsResult
    }

    // 必要な権限を全て持っているかチェック
    const hasAllPermissions = requiredPermissionsResult.data.every((required) =>
      userPermissionsResult.data.some(
        (userPerm) => userPerm.permissionId === required.permissionId,
      ),
    )

    return success(hasAllPermissions)
  }
}
