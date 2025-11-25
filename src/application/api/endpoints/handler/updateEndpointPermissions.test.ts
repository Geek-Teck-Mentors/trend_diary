import { faker } from '@faker-js/faker'
import app from '@/application/server'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import permissionTestHelper from '@/test/helper/permissionTestHelper'

describe('PATCH /api/endpoints/:id/permissions', () => {
  let sessionId: string
  let activeUserId: bigint
  let testEndpointId: number
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
    const authEndpointId = await permissionTestHelper.createEndpoint(
      '/api/endpoints/:id/permissions',
      'PATCH',
    )
    const permissionId = await permissionTestHelper.createPermission('endpoint', 'update')
    await permissionTestHelper.assignPermissionsToEndpoint(authEndpointId, [permissionId])

    // 管理者ロールに権限を追加（既に存在する場合はスキップ）
    await permissionTestHelper.ensureAdminHasPermission(permissionId)

    // seedで作成された管理者ロールを取得してユーザーに割り当て
    const adminRoleId = await permissionTestHelper.getPresetRole('管理者')
    await permissionTestHelper.assignRoleToUser(activeUserId, adminRoleId)

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
    await activeUserTestHelper.cleanUp()
    await permissionTestHelper.cleanUp()
    await setupTestData()
  })

  afterAll(async () => {
    await activeUserTestHelper.cleanUp()
    await permissionTestHelper.cleanUp()
  })

  describe('正常系', () => {
    it('エンドポイントの権限を更新できること', async () => {
      const response = await requestUpdateEndpointPermissions(
        testEndpointId.toString(),
        sessionId,
        [testPermissionId1, testPermissionId2],
      )

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
