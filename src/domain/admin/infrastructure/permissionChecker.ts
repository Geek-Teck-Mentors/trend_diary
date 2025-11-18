/**
 * アプリケーションにおける管理者権限を持つロール名の一覧
 *
 * この一覧が管理者判定の基準となります。
 * ロール名の変更や管理者相当のロールの追加時は、必ずこの定数を更新してください。
 *
 * @see AdminQueryImpl.hasAdminPermissions - SQL版の管理者権限判定
 * @see findAdminRole - userRolesから管理者ロールを探す
 */
export const ADMIN_ROLE_NAMES = ['管理者', 'スーパー管理者'] as const

type UserRoleWithRole = {
  role: {
    displayName: string
  }
}

/**
 * userRolesから管理者ロールを見つける
 */
export function findAdminRole<T extends UserRoleWithRole>(userRoles: T[]): T | undefined {
  return userRoles.find((ur) =>
    ADMIN_ROLE_NAMES.includes(ur.role.displayName as (typeof ADMIN_ROLE_NAMES)[number]),
  )
}
