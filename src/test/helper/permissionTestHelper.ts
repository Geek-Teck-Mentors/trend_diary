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
      // preset=falseのロールとその関連データを削除（テストで作成したロールのみ）
      // 外部キー制約のため、先にrole_permissionsを削除
      await this.rdb.rolePermission.deleteMany({
        where: {
          role: {
            preset: false,
          },
        },
      })
      await this.rdb.role.deleteMany({
        where: {
          preset: false,
        },
      })
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

  async findOrCreatePermission(resource: string, action: string): Promise<number> {
    // 既存の権限を検索
    const existing = await this.rdb.permission.findUnique({
      where: {
        resource_action: { resource, action },
      },
    })
    if (existing) {
      return existing.permissionId
    }

    // 存在しない場合は作成
    const result = await this.permissionUseCase.createPermission({ resource, action })
    if (isFailure(result)) {
      throw new Error(`Failed to create permission: ${result.error.message}`)
    }
    return result.data.permissionId
  }

  async findOrCreateEndpoint(path: string, method: string): Promise<number> {
    // 既存のエンドポイントを検索
    const existing = await this.rdb.endpoint.findUnique({
      where: {
        path_method: { path, method },
      },
    })
    if (existing) {
      return existing.endpointId
    }

    // 存在しない場合は作成
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
