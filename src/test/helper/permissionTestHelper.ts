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
      // user_rolesを全削除（ユーザーとロールの紐付けをクリア）
      await this.rdb.$queryRaw`TRUNCATE TABLE "user_roles" CASCADE;`

      // preset=falseのロールとその関連データを削除（テストで作成したロールのみ）
      await this.rdb
        .$queryRaw`DELETE FROM "role_permissions" WHERE "role_id" IN (SELECT "role_id" FROM "roles" WHERE "preset" = false);`
      await this.rdb.$queryRaw`DELETE FROM "roles" WHERE "preset" = false;`

      // エンドポイント関連は全て削除（seedで管理していない）
      await this.rdb.$queryRaw`TRUNCATE TABLE "endpoint_permissions" CASCADE;`
      await this.rdb.$queryRaw`TRUNCATE TABLE "endpoints" CASCADE;`

      // 権限は削除しない（テストで作成した権限を蓄積して再利用）
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

  async ensureAdminHasPermission(permissionId: number): Promise<void> {
    const adminRole = await this.rdb.role.findFirst({
      where: { preset: true, displayName: '管理者' },
    })
    if (!adminRole) {
      throw new Error('管理者ロールが見つかりません')
    }

    // 既に権限が割り当てられているかチェック
    const existing = await this.rdb.rolePermission.findUnique({
      where: {
        // biome-ignore lint/style/useNamingConvention: Prisma composite unique key name
        roleId_permissionId: {
          roleId: adminRole.roleId,
          permissionId,
        },
      },
    })

    // 存在しない場合のみ追加
    if (!existing) {
      await this.rdb.rolePermission.create({
        data: {
          roleId: adminRole.roleId,
          permissionId,
        },
      })
    }
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const permissionTestHelper = new PermissionTestHelper()
export default permissionTestHelper
