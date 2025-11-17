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
      await this.rdb.$queryRaw`TRUNCATE TABLE "role_permissions" CASCADE;`
      await this.rdb.$queryRaw`TRUNCATE TABLE "endpoint_permissions" CASCADE;`
      await this.rdb.$queryRaw`TRUNCATE TABLE "user_roles" CASCADE;`
      await this.rdb.$queryRaw`TRUNCATE TABLE "roles" CASCADE;`
      await this.rdb.$queryRaw`TRUNCATE TABLE "permissions" CASCADE;`
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

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const permissionTestHelper = new PermissionTestHelper()
export default permissionTestHelper
