import app from '@/application/server'
import TEST_ENV from '@/test/env'
import adminUserTestHelper from '@/test/helper/adminUserTestHelper'
import permissionTestHelper from '@/test/helper/permissionTestHelper'

describe('PATCH /api/endpoints/:id/permissions', () => {
  let sessionId: string
  let testEndpointId: number
  let testPermissionId1: number
  let testPermissionId2: number

  async function setupTestData(): Promise<void> {
    // 管理者ユーザー作成・ログイン
    const adminUser = await adminUserTestHelper.createAdminUser('admin@example.com', 'password123')
    sessionId = adminUser.sessionId

    // テストエンドポイントと権限作成
    testEndpointId = await permissionTestHelper.createEndpoint('/test', 'GET')
    testPermissionId1 = await permissionTestHelper.createPermission('test_resource', 'read')
    testPermissionId2 = await permissionTestHelper.createPermission('test_resource', 'write')
  }

  async function requestUpdateEndpointPermissions(
    id: string,
    sessionId: string,
    permissionIds: number[],
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Cookie: `sid=${sessionId}`,
    }

    return app.request(
      `/api/endpoints/${id}/permissions`,
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
    it('エンドポイントの権限を更新できること', async () => {
      const response = await requestUpdateEndpointPermissions(testEndpointId.toString(), sessionId, [
        testPermissionId1,
        testPermissionId2,
      ])

      expect(response.status).toBe(200)
      const json = (await response.json()) as { message: string }
      expect(json.message).toBe('Endpoint permissions updated successfully')
    })
  })

  describe('準正常系', () => {
    it('無効なidでバリデーションエラーが発生すること', async () => {
      const response = await requestUpdateEndpointPermissions('invalid-id', sessionId, [
        testPermissionId1,
      ])

      expect(response.status).toBe(422)
    })
  })
})
