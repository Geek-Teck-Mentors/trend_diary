import { faker } from '@faker-js/faker'
import app from '@/application/server'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import permissionTestHelper from '@/test/helper/permissionTestHelper'

describe('PATCH /api/roles/:id', () => {
  let sessionId: string
  let activeUserId: bigint
  let testRoleId: number

  async function setupTestData(): Promise<void> {
    // ユーザー作成・ログイン
    const email = faker.internet.email()
    await activeUserTestHelper.create(email, 'password123')
    const loginData = await activeUserTestHelper.login(email, 'password123')
    activeUserId = loginData.activeUserId
    sessionId = loginData.sessionId

    // エンドポイントと権限を作成
    const endpointId = await permissionTestHelper.findOrCreateEndpoint('/api/roles/:id', 'PATCH')
    const permissionId = await permissionTestHelper.createPermission('role', 'update')
    await permissionTestHelper.assignPermissionsToEndpoint(endpointId, [permissionId])

    // seedで作成された管理者ロールを取得してユーザーに割り当て（管理者は既にrole.update権限を持っている）
    const adminRoleId = await permissionTestHelper.getPresetRole('管理者')
    await permissionTestHelper.assignRoleToUser(activeUserId, adminRoleId)

    // テストロール作成
    testRoleId = await permissionTestHelper.createRole('テストロール', 'テスト用のロール')
  }

  async function requestUpdateRole(
    id: string,
    sessionId: string,
    displayName: string,
    description: string | null,
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Cookie: `sid=${sessionId}`,
    }

    return app.request(
      `/api/roles/${id}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          displayName,
          description,
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
    it('ロールを更新できること', async () => {
      const response = await requestUpdateRole(
        testRoleId.toString(),
        sessionId,
        '更新されたロール',
        '更新された説明',
      )

      expect(response.status).toBe(200)
      const json = (await response.json()) as {
        role: { roleId: number; displayName: string; description: string | null }
      }
      expect(json.role.roleId).toBe(testRoleId)
      expect(json.role.displayName).toBe('更新されたロール')
      expect(json.role.description).toBe('更新された説明')
    })
  })

  describe('準正常系', () => {
    it('無効なidでバリデーションエラーが発生すること', async () => {
      const response = await requestUpdateRole('invalid-id', sessionId, '更新されたロール', null)

      expect(response.status).toBe(422)
    })

    it('存在しないロールIDで404エラーが発生すること', async () => {
      const response = await requestUpdateRole('999999', sessionId, '更新されたロール', null)

      expect(response.status).toBe(404)
    })
  })
})
