import app from '@/application/server'
import TEST_ENV from '@/test/env'
import adminUserTestHelper from '@/test/helper/adminUserTestHelper'
import permissionTestHelper from '@/test/helper/permissionTestHelper'

describe('PATCH /api/roles/:id', () => {
  let sessionId: string
  let testRoleId: number

  async function setupTestData(): Promise<void> {
    // 管理者ユーザー作成・ログイン
    const adminUser = await adminUserTestHelper.createAdminUser('admin@example.com', 'password123')
    sessionId = adminUser.sessionId

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
    await adminUserTestHelper.cleanUp()
    await permissionTestHelper.cleanUp()
    await setupTestData()
  })

  afterAll(async () => {
    await adminUserTestHelper.cleanUp()
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
