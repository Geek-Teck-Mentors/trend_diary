import TEST_ENV from '@/test/env'
import adminUserTestHelper from '@/test/helper/adminUserTestHelper'
import app from '../../server'
import { GrantAdminRoleResponse } from './grantAdminRole'

async function requestPostAdminUser(id: string, accessToken?: string) {
  const url = `/api/admin/users/${id}`
  const headers = accessToken ? { Cookie: `sb-access-token=${accessToken}` } : undefined
  return app.request(url, { method: 'POST', headers }, TEST_ENV)
}

describe('POST /api/admin/users/:id', () => {
  beforeEach(async () => {
    await adminUserTestHelper.cleanUp()
  })

  afterEach(async () => {
    await adminUserTestHelper.cleanUp()
  })

  describe('正常系', () => {
    it('Admin権限を持つユーザーが他のユーザーにAdmin権限を付与できる', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
      )

      // 通常ユーザーを作成
      const regularUser = await adminUserTestHelper.createRegularUser(
        'user@example.com',
        'password123',
      )

      // Admin権限を付与
      const res = await requestPostAdminUser(regularUser.userId.toString(), adminUser.accessToken)

      expect(res.status).toBe(200)
      const data = await res.json<GrantAdminRoleResponse>()
      expect(data.userId).toBe(regularUser.userId.toString())
      expect(data.adminUserId).toBeDefined()
      expect(data.grantedAt).toBeDefined()
      expect(data.grantedByAdminUserId).toBe(adminUser.adminUserId)

      // 実際にAdmin権限が付与されたか確認
      const isAdmin = await adminUserTestHelper.isAdmin(regularUser.userId)
      expect(isAdmin).toBe(true)
    })
  })

  describe('準正常系', () => {
    it('認証されていないユーザーは401エラー', async () => {
      // 通常ユーザーを作成
      const regularUser = await adminUserTestHelper.createRegularUser(
        'user@example.com',
        'password123',
      )

      const res = await requestPostAdminUser(regularUser.userId.toString())

      expect(res.status).toBe(401)
    })

    it('Admin権限を持たないユーザーは403エラー', async () => {
      // 通常ユーザーを2人作成
      const regularUser1 = await adminUserTestHelper.createRegularUser(
        'user1@example.com',
        'password123',
      )
      const regularUser2 = await adminUserTestHelper.createRegularUser(
        'user2@example.com',
        'password123',
      )

      // 通常ユーザーが他のユーザーにAdmin権限を付与しようとする
      const res = await requestPostAdminUser(
        regularUser2.userId.toString(),
        regularUser1.accessToken,
      )

      expect(res.status).toBe(403)
    })

    it('存在しないユーザーIDの場合404エラー', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
      )

      // 存在しないユーザーIDでAdmin権限付与を試行
      const nonExistentUserId = '99999'
      const res = await requestPostAdminUser(nonExistentUserId, adminUser.accessToken)

      expect(res.status).toBe(404)
    })

    it('既にAdmin権限を持つユーザーの場合409エラー', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
      )

      // 通常ユーザーを作成してAdmin権限を付与
      const regularUser = await adminUserTestHelper.createRegularUser(
        'user@example.com',
        'password123',
      )
      await adminUserTestHelper.grantAdminRole(regularUser.userId, adminUser.adminUserId)

      // 既にAdmin権限を持つユーザーに再度Admin権限を付与しようとする
      const res = await requestPostAdminUser(regularUser.userId.toString(), adminUser.accessToken)

      expect(res.status).toBe(409)
    })

    it('無効なユーザーIDの場合400エラー', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
      )

      // 無効なユーザーIDでAdmin権限付与を試行
      const invalidUserId = 'invalid-id'
      const res = await requestPostAdminUser(invalidUserId, adminUser.accessToken)

      expect(res.status).toBe(422)
    })

    it('自分自身にAdmin権限を付与しようとした場合400エラー', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
      )

      // 自分自身にAdmin権限を付与しようとする
      const res = await requestPostAdminUser(adminUser.userId.toString(), adminUser.accessToken)

      expect(res.status).toBe(400)
      const responseText = await res.text()
      expect(responseText).toContain('自分自身にAdmin権限を付与することはできません')
    })
  })
})
