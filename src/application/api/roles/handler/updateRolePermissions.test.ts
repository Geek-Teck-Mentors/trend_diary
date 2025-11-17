import { faker } from '@faker-js/faker'
import app from '@/application/server'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import permissionTestHelper from '@/test/helper/permissionTestHelper'

describe('PATCH /api/roles/:id/permissions', () => {
  let sessionId: string
  let activeUserId: bigint
  let testRoleId: number
  let testPermissionId1: number
  let testPermissionId2: number

  async function setupTestData(): Promise<void> {
    // ユーザー作成・ログイン
    const email = faker.internet.email()
    await activeUserTestHelper.create(email, 'password123')
    const loginData = await activeUserTestHelper.login(email, 'password123')
    activeUserId = loginData.activeUserId
    sessionId = loginData.sessionId

    // エンドポイントと権限を作成
    const endpointId = await permissionTestHelper.createEndpoint(
      '/api/roles/:id/permissions',
      'PATCH',
    )
    const permissionId = await permissionTestHelper.createPermission('roles', 'update_permissions')
    await permissionTestHelper.assignPermissionsToEndpoint(endpointId, [permissionId])

    // ロールを作成してユーザーに割り当て
    const adminRoleId = await permissionTestHelper.createRole('管理者', '管理者ロール')
    await permissionTestHelper.assignPermissionsToRole(adminRoleId, [permissionId])
    await permissionTestHelper.assignRoleToUser(activeUserId, adminRoleId)

    // テストロールと権限作成
    testRoleId = await permissionTestHelper.createRole('テストロール', 'テスト用のロール')
    testPermissionId1 = await permissionTestHelper.createPermission('test_resource', 'read')
    testPermissionId2 = await permissionTestHelper.createPermission('test_resource', 'write')
  }

  async function requestUpdateRolePermissions(
    id: string,
    sessionId: string,
    permissionIds: number[],
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Cookie: `sid=${sessionId}`,
    }

    return app.request(
      `/api/roles/${id}/permissions`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          permissionIds,
        }),
      },
      TEST_ENV,
    )
  }

  beforeEach(async () => {
    await activeUserTestHelper.cleanUp()
    await permissionTestHelper.cleanUp()
    await setupTestData()
  })

  afterAll(async () => {
    await activeUserTestHelper.cleanUp()
    await permissionTestHelper.cleanUp()
  })

  describe('正常系', () => {
    it('ロールの権限を更新できること', async () => {
      const response = await requestUpdateRolePermissions(testRoleId.toString(), sessionId, [
        testPermissionId1,
        testPermissionId2,
      ])

      expect(response.status).toBe(200)
      const json = (await response.json()) as { message: string }
      expect(json.message).toBe('Role permissions updated successfully')
    })
  })

  describe('準正常系', () => {
    it('無効なidでバリデーションエラーが発生すること', async () => {
      const response = await requestUpdateRolePermissions('invalid-id', sessionId, [
        testPermissionId1,
      ])

      expect(response.status).toBe(422)
    })
  })
})
