import { isFailure } from '@yuukihayashi0510/core'
import {
  createEndpointUseCase,
  createPermissionUseCase,
  createRoleUseCase,
} from '@/domain/permission'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

process.env.NODE_ENV = 'test'

class PermissionTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  private roleUseCase = createRoleUseCase(this.rdb)
  private permissionUseCase = createPermissionUseCase(this.rdb)
  private endpointUseCase = createEndpointUseCase(this.rdb)

  async cleanUp(): Promise<void> {
    try {
      // user_rolesを全削除（preset roleに割り当てられたユーザーも含む）
      await this.rdb.$queryRaw`TRUNCATE TABLE "user_roles" CASCADE;`

      // preset=falseのロールとその関連データを削除
      await this.rdb
        .$queryRaw`DELETE FROM "role_permissions" WHERE "role_id" IN (SELECT "role_id" FROM "roles" WHERE "preset" = false);`
      await this.rdb.$queryRaw`DELETE FROM "roles" WHERE "preset" = false;`

      // preset=trueのロールに追加されたテスト用の権限を削除（seedに存在しない権限のみ）
      // seedで定義されたパーミッションのリスト
      const seedPermissions = [
        { resource: 'user', action: 'list' },
        { resource: 'user', action: 'read' },
        { resource: 'user', action: 'grant_admin' },
        { resource: 'article', action: 'list' },
        { resource: 'article', action: 'mark_read' },
        { resource: 'article', action: 'mark_unread' },
        { resource: 'privacy_policy', action: 'list' },
        { resource: 'privacy_policy', action: 'read' },
        { resource: 'privacy_policy', action: 'create' },
        { resource: 'privacy_policy', action: 'update' },
        { resource: 'privacy_policy', action: 'delete' },
        { resource: 'privacy_policy', action: 'clone' },
        { resource: 'privacy_policy', action: 'activate' },
        { resource: 'role', action: 'list' },
        { resource: 'role', action: 'read' },
        { resource: 'role', action: 'create' },
        { resource: 'role', action: 'update' },
        { resource: 'role', action: 'delete' },
        { resource: 'role', action: 'assign' },
        { resource: 'role', action: 'revoke' },
        { resource: 'permission', action: 'list' },
        { resource: 'permission', action: 'read' },
        { resource: 'permission', action: 'create' },
        { resource: 'permission', action: 'delete' },
        { resource: 'endpoint', action: 'list' },
        { resource: 'endpoint', action: 'read' },
        { resource: 'endpoint', action: 'create' },
        { resource: 'endpoint', action: 'delete' },
        { resource: 'endpoint', action: 'update' },
      ]

      // seedに存在しないパーミッションを削除
      const conditions = seedPermissions
        .map((p) => `("resource" = '${p.resource}' AND "action" = '${p.action}')`)
        .join(' OR ')
      await this.rdb.$executeRawUnsafe(
        `DELETE FROM "role_permissions" WHERE "permission_id" IN (SELECT "permission_id" FROM "permissions" WHERE NOT (${conditions}));`,
      )
      await this.rdb.$executeRawUnsafe(`DELETE FROM "permissions" WHERE NOT (${conditions});`)

      // エンドポイント関連は全て削除（seedで管理していない）
      await this.rdb.$queryRaw`TRUNCATE TABLE "endpoint_permissions" CASCADE;`
      await this.rdb.$queryRaw`TRUNCATE TABLE "endpoints" CASCADE;`
    } catch (error) {
      if (error instanceof Error && error.message.includes('does not exist')) {
        return
      }
      throw error
    }
  }

  async createRole(displayName: string, description: string | null = null): Promise<number> {
    const result = await this.roleUseCase.createRole({ displayName, description })
    if (isFailure(result)) {
      throw new Error(`Failed to create role: ${result.error.message}`)
    }
    return result.data.roleId
  }

  async getPresetRole(displayName: string): Promise<number> {
    const role = await this.rdb.role.findFirst({
      where: { preset: true, displayName },
    })
    if (!role) {
      throw new Error(`Preset role not found: ${displayName}`)
    }
    return role.roleId
  }

  async createPermission(resource: string, action: string): Promise<number> {
    const result = await this.permissionUseCase.createPermission({ resource, action })
    if (isFailure(result)) {
      throw new Error(`Failed to create permission: ${result.error.message}`)
    }
    return result.data.permissionId
  }

  async createEndpoint(path: string, method: string): Promise<number> {
    const result = await this.endpointUseCase.createEndpoint({ path, method })
    if (isFailure(result)) {
      throw new Error(`Failed to create endpoint: ${result.error.message}`)
    }
    return result.data.endpointId
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<void> {
    const result = await this.roleUseCase.updateRolePermissions(roleId, permissionIds)
    if (isFailure(result)) {
      throw new Error(`Failed to assign permissions to role: ${result.error.message}`)
    }
  }

  async assignPermissionsToEndpoint(endpointId: number, permissionIds: number[]): Promise<void> {
    const result = await this.endpointUseCase.updateEndpointPermissions(endpointId, permissionIds)
    if (isFailure(result)) {
      throw new Error(`Failed to assign permissions to endpoint: ${result.error.message}`)
    }
  }

  async assignRoleToUser(activeUserId: bigint, roleId: number): Promise<void> {
    await this.rdb.userRole.create({
      data: {
        activeUserId,
        roleId,
      },
    })
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const permissionTestHelper = new PermissionTestHelper()
export default permissionTestHelper
