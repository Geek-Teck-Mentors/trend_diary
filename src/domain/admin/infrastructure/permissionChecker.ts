import { RdbClient } from '@/infrastructure/rdb'

/**
 * 管理者ロール名の定義
 */
const ADMIN_ROLE_NAMES = ['管理者', 'スーパー管理者'] as const

/**
 * ロールが管理者ロールかどうかを判定する
 */
function isAdminRole(role: { displayName: string }): boolean {
  return ADMIN_ROLE_NAMES.includes(role.displayName as (typeof ADMIN_ROLE_NAMES)[number])
}

type UserRoleWithRole = {
  role: {
    displayName: string
  }
}

/**
 * userRolesから管理者ロールを見つける
 */
export function findAdminRole<T extends UserRoleWithRole>(userRoles: T[]): T | undefined {
  return userRoles.find((ur) => isAdminRole(ur.role))
}

/**
 * ユーザーが管理者権限を持っているかどうかを判定する（SQL版）
 * activeUserIdから管理者ロールを持っているかをチェックする
 */
export async function hasAdminPermissions(db: RdbClient, activeUserId: bigint): Promise<boolean> {
  const userRoles = await db.userRole.findMany({
    where: { activeUserId },
    include: {
      role: {
        select: { displayName: true },
      },
    },
  })

  return userRoles.some((ur) => isAdminRole(ur.role))
}
