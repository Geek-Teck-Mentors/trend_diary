import { faker } from '@faker-js/faker'
import app from '@/application/server'
import TEST_ENV from '@/test/env'
import adminUserTestHelper from '@/test/helper/adminUserTestHelper'
import permissionTestHelper from '@/test/helper/permissionTestHelper'

describe('PATCH /api/roles/:id/permissions', () => {
  let sessionId: string
  let testRoleId: number
  let testPermissionId1: number
  let testPermissionId2: number

  async function setupTestData(): Promise<void> {
    // 管理者ユーザー作成・ログイン
    const adminUser = await adminUserTestHelper.createAdminUser(
      faker.internet.email(),
      'password123',
    )
    sessionId = adminUser.sessionId

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
    await adminUserTestHelper.cleanUp()
    await permissionTestHelper.cleanUp()
    await setupTestData()
  })

  afterAll(async () => {
    await adminUserTestHelper.cleanUp()
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
