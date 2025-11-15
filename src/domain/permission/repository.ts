import { AsyncResult } from '@yuukihayashi0510/core'
import type { Permission } from './schema/permissionSchema'

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
}
